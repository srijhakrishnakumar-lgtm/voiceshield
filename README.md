# VoiceShield — Real-Time AI Voice Cloning Detection & Impersonation Risk Scoring System

**Smart India Hackathon 2026 — Problem Statement 26104 (AICTE Cyber Security Cell)**

VoiceShield is a fraud-prevention layer designed for banks, telecommunications providers, and enterprise authentication systems to detect AI-generated, synthetic, and cloned voices in real time during phone calls or audio interactions.

---

## System Architecture

```
[Audio Ingestion] ──► [Layer A: Acoustic/Spectral DSP] ──┐
                  ──► [Layer B: Prosody & Micro-Tremor]  ├──► [Composite Risk Engine] ──► [REST API / Dashboard]
                  ──► [Layer C: Speaker Verification]  ──┘
```

---

## Quick Setup & Execution

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure
- `backend/`: FastAPI backend, audio ingestion, detection layers, dynamic risk engine, SQLite database.
- `frontend/`: React + Tailwind dark cyber fraud-ops dashboard.
- `samples/`: Sample audio clips (genuine vs AI-cloned voices in English and Hindi).

---

## Future Scope & Roadmap
- Fine-tuning acoustic models on Indian accent datasets (AI4Bharat, Shruti corpus).
- Telecom-scale deployment via WebRTC / SIP trunk integration.
- On-device edge inference using WebAssembly / ONNX runtime.
- Multi-speaker voiceprint registration & embedding verification.
