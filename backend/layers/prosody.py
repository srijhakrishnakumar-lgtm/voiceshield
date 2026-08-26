import numpy as np
import librosa
from collections import deque

try:
    import parselmouth
    from parselmouth.praat import call
    PARSELMOUTH_AVAILABLE = True
except ImportError:
    PARSELMOUTH_AVAILABLE = False


class ProsodyAnalyzer:
    """
    Prosody & Behavioral Anomaly Detector with rolling 3-chunk history buffer.
    Measures pitch (F0) stability, jitter (pitch micro-tremor), shimmer (amplitude tremor),
    and robotic pause regularity across speech frames.
    """

    def __init__(self, buffer_size: int = 3):
        self.buffer_size = buffer_size
        self.audio_buffer = deque(maxlen=buffer_size)

    def analyze_chunk(self, audio: np.ndarray, sample_rate: int = 16000) -> dict:
        """
        Analyzes current audio chunk combined with rolling 3-chunk history buffer.

        Returns:
            score_0_100 (float): Synthetic prosody anomaly score (0 = Natural, 100 = Synthetic/Cloned)
            details (dict): Extracted features (F0 std, jitter, shimmer, pause regularity)
        """
        self.audio_buffer.append(audio)
        combined_audio = np.concatenate(list(self.audio_buffer))

        if len(combined_audio) < int(sample_rate * 0.3):
            return {
                "score": 0.0,
                "details": {
                    "f0_mean_hz": 0.0,
                    "f0_std_hz": 0.0,
                    "jitter_local": 0.0,
                    "shimmer_local": 0.0,
                    "pause_regularity": 0.0,
                    "rolling_chunks_used": len(self.audio_buffer)
                }
            }

        # 1. Pitch (F0) Tracking
        f0_mean, f0_std = self._extract_f0(combined_audio, sample_rate)

        # 2. Jitter & Shimmer Micro-Tremor
        jitter, shimmer = self._extract_jitter_shimmer(combined_audio, sample_rate)

        # 3. Robotic Pause Regularity (detect unnatural fixed-gap pauses)
        pause_regularity = self._extract_pause_regularity(combined_audio, sample_rate)

        # --- Heuristic Scoring Model (Normalized to 0 - 100) ---
        # Human speech exhibits organic micro-tremor (jitter 0.5% - 2.5%, shimmer 2% - 8%)
        # and natural pitch variance (f0_std > 15Hz).
        # Synthetic speech / TTS often has:
        # - Unnaturally flat pitch (f0_std < 8Hz) or mechanical step pitch jumps
        # - Extremely low jitter (< 0.2%) or high artificial jitter (> 5.0%)
        # - Unnaturally uniform pause duration distributions

        pitch_flatness_risk = np.clip(1.0 - (f0_std / 20.0), 0.0, 1.0) * 40.0

        # Jitter risk (too low = robotic, too high = synthesis artifact)
        if jitter < 0.002:  # < 0.2%
            jitter_risk = np.clip(1.0 - (jitter / 0.002), 0.0, 1.0) * 30.0
        elif jitter > 0.04:  # > 4%
            jitter_risk = np.clip((jitter - 0.04) / 0.04, 0.0, 1.0) * 30.0
        else:
            jitter_risk = 0.0

        # Shimmer risk
        if shimmer < 0.01:
            shimmer_risk = np.clip(1.0 - (shimmer / 0.01), 0.0, 1.0) * 15.0
        else:
            shimmer_risk = 0.0

        pause_risk = np.clip(pause_regularity * 15.0, 0.0, 15.0)

        raw_prosody_score = pitch_flatness_risk + jitter_risk + shimmer_risk + pause_risk
        prosody_score_0_100 = float(np.clip(raw_prosody_score, 0.0, 100.0))

        return {
            "score": round(prosody_score_0_100, 2),
            "details": {
                "f0_mean_hz": round(f0_mean, 1),
                "f0_std_hz": round(f0_std, 2),
                "jitter_local": round(jitter, 4),
                "shimmer_local": round(shimmer, 4),
                "pause_regularity": round(pause_regularity, 3),
                "rolling_chunks_used": len(self.audio_buffer)
            }
        }

    def _extract_f0(self, audio: np.ndarray, sample_rate: int):
        if PARSELMOUTH_AVAILABLE:
            try:
                sound = parselmouth.Sound(audio, sampling_frequency=sample_rate)
                pitch = sound.to_pitch()
                pitch_values = pitch.selected_array['frequency']
                pitch_values = pitch_values[pitch_values > 0]  # Exclude unvoiced frames
                if len(pitch_values) > 0:
                    return float(np.mean(pitch_values)), float(np.std(pitch_values))
            except Exception:
                pass

        # Librosa fallback (pyin)
        try:
            f0, voiced_flag, _ = librosa.pyin(audio, sr=sample_rate, fmin=75, fmax=500)
            f0_clean = f0[~np.isnan(f0)]
            if len(f0_clean) > 0:
                return float(np.mean(f0_clean)), float(np.std(f0_clean))
        except Exception:
            pass

        return 120.0, 15.0

    def _extract_jitter_shimmer(self, audio: np.ndarray, sample_rate: int):
        if PARSELMOUTH_AVAILABLE:
            try:
                sound = parselmouth.Sound(audio, sampling_frequency=sample_rate)
                point_process = call(sound, "To PointProcess (periodic, cc)", 75, 500)
                jitter = call(point_process, "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3)
                shimmer = call([sound, point_process], "Get shimmer (local)", 0, 0, 0.0001, 0.02, 1.3, 1.6)

                jitter = 0.0 if np.isnan(jitter) else float(jitter)
                shimmer = 0.0 if np.isnan(shimmer) else float(shimmer)
                return jitter, shimmer
            except Exception:
                pass

        # Fallback estimation using zero crossing rate & amplitude variance
        zcr = librosa.feature.zero_crossing_rate(audio)
        jitter_est = float(np.std(zcr) * 0.05)
        shimmer_est = float(np.std(np.abs(audio)) * 0.1)
        return jitter_est, shimmer_est

    def _extract_pause_regularity(self, audio: np.ndarray, sample_rate: int):
        # Calculate frame energies to detect pauses
        frame_len = int(sample_rate * 0.02)  # 20ms
        frames = [audio[i:i + frame_len] for i in range(0, len(audio) - frame_len, frame_len)]
        energies = [np.sum(f ** 2) for f in frames]

        if not energies:
            return 0.0

        median_energy = np.median(energies)
        is_pause = [1 if e < median_energy * 0.1 else 0 for e in energies]

        # Calculate lengths of silent pause blocks
        pause_lengths = []
        curr = 0
        for p in is_pause:
            if p == 1:
                curr += 1
            else:
                if curr > 0:
                    pause_lengths.append(curr)
                    curr = 0

        if len(pause_lengths) < 2:
            return 0.0

        # Regularity is high if pause length standard deviation is unnaturally low
        std_pause = np.std(pause_lengths)
        regularity = float(1.0 / (std_pause + 1.0))
        return regularity
