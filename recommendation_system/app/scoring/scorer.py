from app.core.config import WEIGHTS as LEARNED_WEIGHTS

# -----------------------------
# Default fallback weights
# -----------------------------
DEFAULT_WEIGHTS = {
    "distance": 0.3,
    "interest": 0.3,
    "time": 0.15,
    "host": 0.1,
    "popularity": 0.1,
    "collab": 0.1,
    "trust": 0.05,
    "engagement": 0.05
}


def get_active_weights():
    """
    Use learned weights if at least one is non-zero,
    otherwise fall back to default weights.
    """
    if not LEARNED_WEIGHTS:
        return DEFAULT_WEIGHTS

    if all(weight == 0 for weight in LEARNED_WEIGHTS.values()):
        return DEFAULT_WEIGHTS

    return LEARNED_WEIGHTS


def score_event(features: dict):
    """
    Compute final recommendation score and per-feature breakdown
    """
    weights = get_active_weights()

    total_score = 0.0
    breakdown = {}

    for feature_name, value in features.items():
        weight = weights.get(feature_name, 0.0)
        contribution = value * weight
        total_score += contribution

        breakdown[feature_name] = {
            "value": round(value, 4),
            "weight": round(weight, 4),
            "contribution": round(contribution, 4)
        }

    return round(total_score, 4), breakdown
