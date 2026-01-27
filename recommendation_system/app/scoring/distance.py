from math import radians, sin, cos, asin, sqrt
from app.core.config import MAX_DISTANCE_KM


def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    """
    Returns distance in KM between two GPS points.
    """
    lat1, lon1, lat2, lon2 = map(
        radians, [lat1, lon1, lat2, lon2]
    )

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 6371 * 2 * asin(sqrt(a))


def distance_score(
    user_lat: float,
    user_lon: float,
    event_lat: float,
    event_lon: float
) -> float:
    """
    Score decays linearly from 1 → 0 as distance approaches MAX_DISTANCE_KM.
    """
    distance_km = haversine_distance(
        user_lat, user_lon, event_lat, event_lon
    )

    if distance_km >= MAX_DISTANCE_KM:
        return 0.0

    return round(1 - (distance_km / MAX_DISTANCE_KM), 4)
