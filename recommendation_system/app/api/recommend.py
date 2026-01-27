from fastapi import APIRouter
import random

from app.utils.load_learned import load_popularity, load_collab_scores
from app.models.request import RecommendationRequest
from app.models.response import RecommendationResponse
from app.scoring.scorer import score_event
from app.scoring.explain import explain_event
from app.scoring.distance import distance_score
from app.scoring.interest import interest_score
from app.scoring.time_score import time_score
from app.core.settings import ENABLE_EXPLANATION

router = APIRouter()

# Exploration config
EXPLORATION_RATE = 0.1
MIN_EVENTS_FOR_EXPLORATION = 5


@router.post("/recommend", response_model=RecommendationResponse)
def recommend(request: RecommendationRequest):

    user = request.user
    results = []

    # 🔹 Load learned signals ONCE per request
    popularity_map = load_popularity()
    collab_map = load_collab_scores()

    user_id = user.user_id  # backend must send this

    for event in request.events:

        # 🔹 Inject learned signals internally
        popularity_score = popularity_map.get(event.event_id, 0.0)
        collab_score = collab_map.get(user_id, {}).get(event.event_id, 0.0)

        # ---------- Feature computation ----------
        features = {
            "distance": distance_score(
                user.latitude,
                user.longitude,
                event.latitude,
                event.longitude
            ),
            "interest": interest_score(
                user.interests,
                event.category
            ),
            "time": time_score(event.start_time),
            "host": event.host_score,
            "trust": event.trust_score,
            "popularity": popularity_score,
            "collab": collab_score,
            "engagement": user.engagement_score
        }

        # ---------- Scoring ----------
        score, breakdown = score_event(features)

        result = {
            "event_id": event.event_id,
            "score": score
        }

        # ---------- Explainability (dev only) ----------
        if ENABLE_EXPLANATION:
            result["explanation"] = explain_event(breakdown)
            result["debug"] = breakdown

        results.append(result)

    # ---------- Ranking ----------
    results.sort(key=lambda x: x["score"], reverse=True)

    # ---------- Exploration ----------
    if (
        len(results) >= MIN_EVENTS_FOR_EXPLORATION
        and random.random() < EXPLORATION_RATE
    ):
        i, j = random.sample(range(len(results)), 2)
        results[i], results[j] = results[j], results[i]

    return {"results": results}
