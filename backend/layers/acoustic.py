import numpy as np
import librosa


def extract_acoustic_features(audio: np.ndarray, sample_rate: int = 16000) -> dict:
    """
    Extracts acoustic/spectral features from audio buffer:
    - MFCC statistics and delta variance
    - Spectral flatness (indicative of vocoder noise floor)
    - Spectral roll-off & high-frequency ratio
    - Spectral flux (frame-to-frame spectral variation)

    Returns:
        score_0_100 (float): Synthetic acoustic probability score (0 = Natural, 100 = Synthetic/Cloned)
        feature_details (dict): Raw feature measurements for UI breakdown
    """
    if len(audio) < int(sample_rate * 0.2):  # Less than 200ms
        return {
            "score": 0.0,
            "details": {
                "mfcc_variance": 0.0,
                "spectral_flatness": 0.0,
                "spectral_rolloff": 0.0,
                "hf_ratio": 0.0,
                "spectral_flux": 0.0
            }
        }

    # 1. MFCC & Delta MFCC Variance
    mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=13)
    delta_mfccs = librosa.feature.delta(mfccs)
    mfcc_var = float(np.mean(np.var(mfccs, axis=1)))
    delta_mfcc_var = float(np.mean(np.var(delta_mfccs, axis=1)))

    # 2. Spectral Flatness (vocoder noise artifact indicator)
    spec_flatness = librosa.feature.spectral_flatness(y=audio)
    mean_flatness = float(np.mean(spec_flatness))

    # 3. Spectral Rolloff (High frequency distribution)
    rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sample_rate, roll_percent=0.85)
    mean_rolloff = float(np.mean(rolloff))

    # 4. High-Frequency Energy Ratio (>4kHz vs total)
    fft_vals = np.abs(np.fft.rfft(audio))
    freqs = np.fft.rfftfreq(len(audio), 1.0 / sample_rate)
    total_energy = np.sum(fft_vals ** 2) + 1e-10
    hf_energy = np.sum(fft_vals[freqs >= 4000] ** 2)
    hf_ratio = float(hf_energy / total_energy)

    # 5. Spectral Flux
    stft = np.abs(librosa.stft(audio))
    spectral_flux = float(np.mean(np.diff(stft, axis=1) ** 2))

    # --- Heuristic Scoring Model (Normalized to 0 - 100) ---
    # Synthetic TTS/clones typically show:
    # - Lower delta MFCC variance (overly smooth spectral transitions)
    # - Higher or unnaturally uniform spectral flatness
    # - Lower spectral flux (lack of organic micro-transitions)
    # - Abnormal high-frequency energy ratio drop-offs

    smoothness_risk = np.clip(1.0 - (delta_mfcc_var / 15.0), 0.0, 1.0) * 35.0
    flatness_risk = np.clip(mean_flatness / 0.05, 0.0, 1.0) * 25.0
    flux_risk = np.clip(1.0 - (spectral_flux / 0.8), 0.0, 1.0) * 20.0
    hf_risk = np.clip(1.0 - (hf_ratio / 0.15), 0.0, 1.0) * 20.0

    raw_synthetic_score = smoothness_risk + flatness_risk + flux_risk + hf_risk
    synthetic_score_0_100 = float(np.clip(raw_synthetic_score, 0.0, 100.0))

    return {
        "score": round(synthetic_score_0_100, 2),
        "details": {
            "mfcc_variance": round(mfcc_var, 3),
            "delta_mfcc_variance": round(delta_mfcc_var, 3),
            "spectral_flatness": round(mean_flatness, 5),
            "spectral_rolloff_hz": round(mean_rolloff, 1),
            "hf_energy_ratio": round(hf_ratio, 4),
            "spectral_flux": round(spectral_flux, 4)
        }
    }
