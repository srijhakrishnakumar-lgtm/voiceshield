from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db

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
