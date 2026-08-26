import os
import sys
import glob

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.audio import load_and_preprocess_audio
from backend.layers.acoustic import extract_acoustic_features
from backend.layers.prosody import ProsodyAnalyzer
from backend.scoring import calculate_composite_risk


def run_calibration():
    samples_dir = os.path.join(PROJECT_ROOT, "samples")
    
    if not os.path.exists(samples_dir):
        print(f"Error: Samples directory not found at {samples_dir}")
        return

    genuine_files = sorted(glob.glob(os.path.join(samples_dir, "genuine", "**", "*.wav"), recursive=True))
    cloned_files = sorted(glob.glob(os.path.join(samples_dir, "cloned", "**", "*.wav"), recursive=True))

    all_targets = [(f, "genuine") for f in genuine_files] + [(f, "cloned") for f in cloned_files]

    if not all_targets:
        print(f"No .wav files found in {samples_dir}/genuine or {samples_dir}/cloned")
        return

    print("\n" + "=" * 115)
    print("                              VOICESHIELD PIPELINE CALIBRATION REPORT                              ")
    print("=" * 115)
    print(f"{'Filename':<28} | {'Expected':<8} | {'Layer A':<8} | {'Layer B':<8} | {'Composite':<9} | {'Verdict':<10} | {'Status'}")
    print("-" * 115)

    genuine_scores = []
    cloned_scores = []
    mismatches = []
    
    # Track sub-score values across files to verify no term is stuck at 0.0 or max
    subterm_history = {
        "flatness_risk": [],
        "hf_risk": [],
        "flux_risk": [],
        "smoothness_risk": [],
        "pitch_flatness_risk": [],
        "jitter_risk": [],
        "shimmer_risk": [],
        "pause_risk": []
    }

    for file_path, expected_label in all_targets:
        filename = os.path.basename(file_path)
        
        try:
            with open(file_path, "rb") as f:
                audio_bytes = f.read()

            audio_data, sr, vad_info = load_and_preprocess_audio(audio_bytes)

            acoustic_res = extract_acoustic_features(audio_data, sample_rate=sr)
            layer_a_score = acoustic_res["score"]

            prosody_analyzer = ProsodyAnalyzer(buffer_size=5)
            prosody_res = prosody_analyzer.analyze_chunk(audio_data, sample_rate=sr)
            layer_b_score = prosody_res["score"]

            scoring_res = calculate_composite_risk(layer_a_score, layer_b_score)
            composite_score = scoring_res["composite_score"]
            verdict = scoring_res["verdict"]

            # Track sub-terms
            a_subs = acoustic_res["details"].get("sub_scores", {})
            b_subs = prosody_res["details"].get("sub_scores", {})

            for k in ["flatness_risk", "hf_risk", "flux_risk", "smoothness_risk"]:
                subterm_history[k].append(a_subs.get(k, 0.0))
            for k in ["pitch_flatness_risk", "jitter_risk", "shimmer_risk", "pause_risk"]:
                subterm_history[k].append(b_subs.get(k, 0.0))

            if expected_label == "genuine":
                genuine_scores.append((layer_a_score, layer_b_score, composite_score))
                if verdict in ["HIGH", "CRITICAL"]:
                    status = "[MISMATCH - False Pos]"
                    mismatches.append((filename, expected_label, composite_score, verdict))
                else:
                    status = "OK"
            else:
                cloned_scores.append((layer_a_score, layer_b_score, composite_score))
                if verdict == "LOW":
                    status = "[MISMATCH - False Neg]"
                    mismatches.append((filename, expected_label, composite_score, verdict))
                else:
                    status = "OK"

            print(f"{filename:<28} | {expected_label:<8} | {layer_a_score:<8.2f} | {layer_b_score:<8.2f} | {composite_score:<9.2f} | {verdict:<10} | {status}")

        except Exception as e:
            print(f"{filename:<28} | {expected_label:<8} | ERROR: {str(e)}")

    print("-" * 115)

    print("\n" + "=" * 65)
    print("                     SUMMARY STATISTICS                     ")
    print("=" * 65)

    if genuine_scores:
        avg_a_gen = sum(x[0] for x in genuine_scores) / len(genuine_scores)
        avg_b_gen = sum(x[1] for x in genuine_scores) / len(genuine_scores)
        avg_comp_gen = sum(x[2] for x in genuine_scores) / len(genuine_scores)
        print(f"Genuine Clips Count      : {len(genuine_scores)}")
        print(f"  - Avg Layer A Score    : {avg_a_gen:.2f}")
        print(f"  - Avg Layer B Score    : {avg_b_gen:.2f}")
        print(f"  - Avg Composite Score  : {avg_comp_gen:.2f}")

    print("-" * 65)

    if cloned_scores:
        avg_a_clone = sum(x[0] for x in cloned_scores) / len(cloned_scores)
        avg_b_clone = sum(x[1] for x in cloned_scores) / len(cloned_scores)
        avg_comp_clone = sum(x[2] for x in cloned_scores) / len(cloned_scores)
        print(f"Cloned Clips Count       : {len(cloned_scores)}")
        print(f"  - Avg Layer A Score    : {avg_a_clone:.2f}")
        print(f"  - Avg Layer B Score    : {avg_b_clone:.2f}")
        print(f"  - Avg Composite Score  : {avg_comp_clone:.2f}")

    print("-" * 65)

    if genuine_scores and cloned_scores:
        score_gap = avg_comp_clone - avg_comp_gen
        print(f"Score Separation Margin  : {score_gap:+.2f} points (Cloned vs Genuine)")

    print("-" * 65)

    print("\n" + "=" * 65)
    print("               SUB-TERM HEALTH AUDIT CHECK               ")
    print("=" * 65)
    all_healthy = True
    for term, vals in subterm_history.items():
        min_v, max_v, avg_v = min(vals), max(vals), sum(vals)/len(vals)
        all_zeros = all(v == 0.0 for v in vals)
        stuck_max = all(v == max_v for v in vals) and max_v > 0
        is_healthy = not (all_zeros or stuck_max)
        if not is_healthy:
            all_healthy = False

        status_str = "OK (Active)" if is_healthy else "[!] STUCK AT SAME VALUE"
        print(f"  - {term:<22}: Min={min_v:5.2f}, Max={max_v:5.2f}, Avg={avg_v:5.2f} -> {status_str}")

    print("-" * 65)
    if all_healthy:
        print("[OK] SUB-TERM AUDIT CONFIRMED: ALL risk terms are active & dynamic across files!")
    else:
        print("[!] AUDIT WARNING: One or more sub-terms are stuck.")
    print("=" * 65)

    if mismatches:
        print(f"\n[!] MISMATCH WARNINGS ({len(mismatches)} files):")
        for fname, exp, score, v in mismatches:
            print(f"  - {fname}: expected '{exp}', got score {score} ({v})")
    else:
        print("\n[OK] ALL CLIPS MATCHED EXPECTED VERDICTS PERFECTLY!")

    print("=" * 65 + "\n")


if __name__ == "__main__":
    run_calibration()
