from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime
from backend.database import Base


class ChunkLog(Base):
    __tablename__ = "chunk_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True, default="default-session")
    chunk_index = Column(Integer, index=True)
    layer_a_score = Column(Float, nullable=False)  # 0 - 100 Acoustic / Spectral
    layer_b_score = Column(Float, nullable=False)  # 0 - 100 Prosody / Behavioral
    composite_score = Column(Float, nullable=False)  # 0 - 100 Composite Risk
    verdict = Column(String, nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    recommended_action = Column(String, nullable=False)  # PASS, STEP_UP_MFA, CALLBACK_VERIFY, BLOCK_TRANSACTION
    timestamp = Column(DateTime, default=datetime.utcnow)
