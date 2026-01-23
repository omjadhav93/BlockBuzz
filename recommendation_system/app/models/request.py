from pydantic import BaseModel

class User(BaseModel):
    user_id: str
    latitude: float
    longitude: float
    interests: list[str]
    engagement_score: float = 0.0



class Event(BaseModel):
    event_id: str
    latitude: float
    longitude: float
    category: list[str]
    start_time: str

    # learned / backend-provided signals
    host_score: float = 0.0
    trust_score: float = 0.0


class RecommendationRequest(BaseModel):
    user: User
    events: list[Event]
