import io
import numpy as np
import soundfile as sf
import librosa
from scipy.signal import resample_poly


TARGET_SAMPLE_RATE = 16000


def load_and_preprocess_audio(audio_bytes: bytes, target_sr: int = TARGET_SAMPLE_RATE):
    """
    Decodes audio bytes (WAV/FLAC/OGG), converts to mono float32,
    resamples to 16kHz mono, and applies VAD silence trimming.

    Returns:
        audio_16k (np.ndarray): 16kHz mono float32 audio array normalized [-1, 1]
        sr (int): Target sample rate (16000)
        vad_info (dict): Metadata including original duration, trimmed duration, active speech ratio
    """
    try:
        # Load audio using soundfile first, fallback to librosa if needed
        audio_data, sr = sf.read(io.BytesIO(audio_bytes), dtype='float32')
    except Exception:
        # Fallback using librosa io
        audio_data, sr = librosa.load(io.BytesIO(audio_bytes), sr=None, mono=False)
        audio_data = audio_data.T if audio_data.ndim > 1 else audio_data

    # Convert to mono if multi-channel
    if audio_data.ndim > 1:
        audio_data = np.mean(audio_data, axis=1)

    # Resample to 16000 Hz if necessary
    if sr != target_sr:
        # Fast polyphase resampling
        audio_16k = librosa.resample(y=audio_data, orig_sr=sr, target_sr=target_sr)
        sr = target_sr
    else:
        audio_16k = audio_data

    # Ensure float32 range [-1, 1]
    max_val = np.max(np.abs(audio_16k))
    if max_val > 0:
        audio_16k = audio_16k / max_val

    orig_duration = len(audio_16k) / target_sr

    # Voice Activity Detection (VAD) using frame RMS energy thresholding
    trimmed_audio, speech_ratio = apply_vad(audio_16k, sample_rate=target_sr)
    trimmed_duration = len(trimmed_audio) / target_sr

    return trimmed_audio, target_sr, {
        "original_duration_sec": round(orig_duration, 2),
        "active_duration_sec": round(trimmed_duration, 2),
        "speech_ratio": round(speech_ratio, 2)
    }


def apply_vad(audio: np.ndarray, sample_rate: int = 16000, frame_ms: int = 30, energy_threshold_db: float = -35.0):
    """
    Energy-based Voice Activity Detector (VAD).
    Splits audio into 30ms frames and filters out frames below energy threshold.
    """
    if len(audio) == 0:
        return audio, 0.0

    frame_length = int(sample_rate * (frame_ms / 1000.0))
    num_frames = len(audio) // frame_length

    if num_frames == 0:
        return audio, 1.0

    speech_frames = []
    total_active = 0

    for i in range(num_frames):
        frame = audio[i * frame_length: (i + 1) * frame_length]
        rms = np.sqrt(np.mean(frame ** 2) + 1e-10)
        db = 20 * np.log10(rms + 1e-10)

        if db > energy_threshold_db:
            speech_frames.append(frame)
            total_active += 1

    speech_ratio = total_active / float(num_frames)

    if speech_frames:
        trimmed_audio = np.concatenate(speech_frames)
    else:
        # If all frames are silent, return original audio to prevent downstream crash
        trimmed_audio = audio

    return trimmed_audio, speech_ratio
