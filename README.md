# VoiceShield — Real-Time AI Voice Cloning Detection & Impersonation Risk Scoring System

**Smart India Hackathon 2026 — Problem Statement 26104 (AICTE Cyber Security Cell)**

VoiceShield is an enterprise fraud-prevention engine designed for banks, telecommunications providers, and call-center authentication systems to detect AI-generated, synthetic, and cloned voices during audio interactions.

---

## 1. System Architecture

```text
               [Audio Ingestion / File Stream]
                             │
                  [VAD & Audio Preprocessing]
                             │
     ┌───────────────────────┴───────────────────────┐
     ▼                                               ▼
[Layer A: Acoustic / Spectral DSP]      [Layer B: Prosody & Micro-Tremor]
 - MFCC & Delta MFCC Variance            - F0 Pitch Std & Intonation
 - Spectral Flatness (Vocoder Floor)     - Jitter (Micro-Pitch Tremor)
 - High-Frequency Ratio (>4kHz)          - Shimmer (Amplitude Tremor)
 - Spectral Flux (Transitions)           - Robotic Pause Regularity
     │                                               │
     └───────────────────────┬───────────────────────┘
                             ▼
        [Cross-Layer Validation & Noise Dampening]
                             │
                             ▼
                  [Composite Risk Engine]
          Risk = 0.6 * EffectiveLayerA + 0.4 * LayerB
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
[Verdict & Protocol]  [SQLite Audit Log]    [REST API & Cyber UI]
  LOW -> PASS           No Raw Audio Stored   FastAPI / React + Tailwind
  MEDIUM -> STEP_UP_MFA (Scores & Verdicts)
  HIGH -> CALLBACK
  CRITICAL -> BLOCK
```

---

## 2. Quick Setup & Execution

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+**

### Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```
- Interactive Swagger API Docs: `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:3000` (or `http://localhost:5173`) in your browser.

---

## 3. Scoring Methodology & Detection Engine

### Layer A: Acoustic & Spectral DSP Features
- **Spectral Flatness:** Detects artificial noise floor artifacts introduced by neural vocoders (e.g., WaveNet, HiFi-GAN).
- **High-Frequency Energy Ratio:** Measures spectral energy above 4kHz to detect synthetic high-frequency noise spillover.
- **Spectral Flux:** Quantifies frame-to-frame spectral variation; synthetic audio exhibits lower, overly uniform flux.
- **Delta MFCC Variance:** Tracks dynamic spectral transition smoothness across frames.

### Layer B: Prosody & Micro-Tremor Behavioral Features
- **Pitch Standard Deviation ($F_0$ Std):** Tracks pitch contour variation; TTS voices frequently display unnaturally monotone pitch contours.
- **Jitter & Shimmer Micro-Tremor:** Measures fundamental frequency ($F_0$) perturbation (jitter) and peak amplitude variation (shimmer). Organic human vocal folds produce micro-instabilities that vocoders smooth out or corrupt.
- **Pause Regularity:** Detects unnatural, fixed-duration silent gaps common in synthetic text-to-speech output.

### Cross-Layer Validation & Room Noise Dampening
Microphone background room noise (hiss) can artificially inflate Layer A spectral noise metrics. VoiceShield applies a **Cross-Layer Prosody Validation Check**:
- If Layer B (Prosody) confirms demonstrably human speech ($F_0\text{ Std} > 40\text{ Hz}$, organic shimmer, and low pause regularity), the engine recognizes elevated spectral noise as room mic hiss rather than a neural vocoder, applying a **30% noise-dampening adjustment** to Layer A.
- If Layer B detects synthetic prosody anomalies, full acoustic risk weighting is preserved.

### Composite Formula & Decision Thresholds
$$\text{Composite Risk} = 0.6 \times \text{EffectiveLayerA} + 0.4 \times \text{LayerB}$$

| Risk Score Range | Risk Verdict | Automated Protocol Action |
| :--- | :--- | :--- |
| **$< 35.0$** | **`LOW`** | **`PASS`** (Allow transaction) |
| **$35.0 - 65.0$** | **`MEDIUM`** | **`STEP_UP_MFA`** (Trigger secondary authentication) |
| **$65.0 - 85.0$** | **`HIGH`** | **`CALLBACK_VERIFY`** (Out-of-band mobile verification) |
| **$> 85.0$** | **`CRITICAL`** | **`BLOCK_TRANSACTION`** (Revoke session immediately) |

---

## 4. Pipeline Calibration & Performance Summary

Running `backend/calibrate.py` across all demo sample audio clips yields the following score separation:

### Default Demo Pair Benchmark (`speaker01_en_01.wav`)
- **Genuine Clip (`speaker01_en_01.wav`):** Composite Score **21.01** (`LOW` Risk $\rightarrow$ `PASS`)
- **Cloned Clip (`speaker01_en_01.wav`):** Composite Score **56.65** (`MEDIUM` Risk $\rightarrow$ `STEP_UP_MFA`)
- **Score Separation Margin:** **+35.64 Points**

### Full Calibration Summary
- **Genuine Clips Avg Composite Score:** **35.23** (Layer A: 35.80, Layer B: 41.59)
- **Cloned Clips Avg Composite Score:** **45.11** (Layer A: 46.90, Layer B: 48.66)
- **Overall Separation Margin:** **+9.89 Points**
- **Sub-Term Health:** All 8 risk terms are active, continuous, and dynamic across files.

---

## 5. Privacy & Regulatory Compliance (DPDP Act 2023)

VoiceShield is engineered with a **Zero Raw Audio Persistence Principle**:
- **Ephemeral Processing:** Audio buffers exist in memory only during feature extraction ($<50\text{ ms}$) and are immediately garbage-collected.
- **Audit-Only Retention:** No raw voice recordings, audio waveforms, or speech files are stored on disk or saved in databases.
- **SQLite Audit Logs (`chunk_logs`):** Stores anonymized numerical scores (`layer_a_score`, `layer_b_score`, `composite_score`), verdicts, and action strings for security compliance.

---

## 6. Known Limitations & Demo Recommendations

1. **Band-Limited / Dynamic-Pitch TTS Evasion:**
   High-quality, heavily low-pass-filtered TTS generators with synthetic dynamic pitch modulation (e.g., band-limited neural cloned clips like `speaker02_ta_02_`) can currently bypass high-frequency spectral noise and pitch flatness penalties.
2. **Ambient Microphone Hiss (Speaker 02 Hindi Recordings):**
   `speaker02` Hindi genuine recordings run warm on Layer A due to strong room background mic noise. While cross-layer dampening reduces the composite score, **using Speaker 01 or Speaker 03 audio clips is explicitly recommended for live demonstrations**, as they exhibit clean, wide separation margins (+35.64 points).
3. **High-Fidelity Commercial TTS Evasion (ElevenLabs and similar):**
   Testing against modern commercial voice cloning platforms (e.g., ElevenLabs) revealed that high-quality neural TTS with advanced prosody modeling can evade detection, scoring LOW/PASS despite being fully synthetic. This is consistent with the Tamil TTS edge case already documented, and reflects a known limitation of DSP/prosody-based detection against state-of-the-art cloning tools. This finding directly motivates the Layer C / deep-learning-based detection roadmap item as the highest priority next step, since acoustic-only detection has a natural ceiling against the newest generation of voice synthesis models.
4. **Simulated File Ingestion vs. Live Streaming:**
   The current demonstration UI uses file-based audio ingestion (`.wav`) to simulate chunk-by-chunk processing. Real-time live microphone streaming over WebSockets is scoped as Future Work.

---

## 7. Future Scope & Roadmap

- **Layer C Integration:** Speaker registration and embedding verification (ECAPA-TDNN / ResNet-based voiceprint matching).
- **Live Streaming Infrastructure:** WebSocket & WebRTC live microphone stream ingestion for call center agent dashboards.
- **Multilingual Model Fine-Tuning:** Fine-tuning acoustic thresholds on diverse Indian accent corpora (AI4Bharat, Shruti dataset).
- **Telecom-Scale Deployment:** SIP trunk integration for real-time mobile/telecom network fraud prevention.
- **Edge Inference:** On-device client-side inference using WebAssembly and ONNX Runtime.
