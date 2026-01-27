from datetime import datetime, timezone


def time_score(event_start_time: str) -> float:
    """
    Higher score for events happening sooner.
    """
    try:
        start_time = datetime.fromisoformat(event_start_time)
        now = datetime.now(timezone.utc)

        delta_days = max((start_time - now).days, 0)
        return round(1 / (1 + delta_days), 4)

    except Exception:
        # Safe fallback
        return 0.0
