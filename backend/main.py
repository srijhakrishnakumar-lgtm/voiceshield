from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.database import get_db, init_db
from backend.models import ChunkLog
from backend.audio import load_and_preprocess_audio
from backend.layers.acoustic import extract_acoustic_features
from backend.layers.prosody import ProsodyAnalyzer
from backend.scoring import calculate_composite_risk

app = FastAPI(
    title="VoiceShield API",
    description="Real-Time AI Voice Cloning Detection & Impersonation Risk Scoring System API",
    version="1.0.0",
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    init_db()


@app.get("/")
def read_root():
    return {
        "system": "VoiceShield AI Voice Cloning Detection Platform",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.post("/api/analyze-audio-chunk")
async def analyze_audio_chunk(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form("default-session"),
    chunk_index: Optional[int] = Form(1),
    db: Session = Depends(get_db),
):
    """
    Analyzes an uploaded audio chunk through the VoiceShield multi-layer pipeline:
    1. VAD & Audio Preprocessing
    2. Layer A: Acoustic / Spectral Feature Extraction
    3. Layer B: Prosody & Micro-Tremor Detection
    4. Composite Risk Engine & Action Mapping

    Logs verdict and scores to SQLite database without retaining raw audio.
    """
    audio_bytes = await file.read()

    # 1. Preprocessing & VAD
    audio_data, sr, vad_info = load_and_preprocess_audio(audio_bytes)

    # 2. Layer A: Acoustic Features
    acoustic_res = extract_acoustic_features(audio_data, sample_rate=sr)

    # 3. Layer B: Prosody Features
    prosody_analyzer = ProsodyAnalyzer(buffer_size=5)
    prosody_res = prosody_analyzer.analyze_chunk(audio_data, sample_rate=sr)

    # 4. Composite Risk Engine
    risk_res = calculate_composite_risk(acoustic_res["score"], prosody_res["score"])

    # 5. Log to Database (SQLite)
    log_entry = ChunkLog(
        filename=file.filename,
        session_id=session_id,
        chunk_index=chunk_index,
        layer_a_score=acoustic_res["score"],
        layer_b_score=prosody_res["score"],
        composite_score=risk_res["composite_score"],
        verdict=risk_res["verdict"],
        recommended_action=risk_res["recommended_action"],
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    return {
        "filename": file.filename,
        "layer_a_score": acoustic_res["score"],
        "layer_b_score": prosody_res["score"],
        "composite_score": risk_res["composite_score"],
        "verdict": risk_res["verdict"],
        "recommended_action": risk_res["recommended_action"],
    }


@app.get("/api/history")
def get_analysis_history(db: Session = Depends(get_db)):
    """
    Returns all previously analyzed chunks from the chunk_logs SQLite table, most recent first.
    """
    logs = db.query(ChunkLog).order_by(ChunkLog.id.desc()).all()
    return [
        {
            "id": log.id,
            "filename": log.filename,
            "session_id": log.session_id,
            "chunk_index": log.chunk_index,
            "layer_a_score": log.layer_a_score,
            "layer_b_score": log.layer_b_score,
            "composite_score": log.composite_score,
            "verdict": log.verdict,
            "recommended_action": log.recommended_action,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        }
        for log in logs
    ]
