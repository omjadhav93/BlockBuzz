from pydantic import BaseModel
from typing import Optional, Dict, Any

class ScoredEvent(BaseModel):
    event_id: str
    score: float
    explanation: Optional[list[str]] = None
    debug: Optional[Dict[str, Any]] = None


class RecommendationResponse(BaseModel):
    results: list[ScoredEvent]
