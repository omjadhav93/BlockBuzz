def interest_score(
    user_interests: list[str],
    event_categories: list[str]
) -> float:
    """
    Jaccard-style interest matching.
    """
    if not user_interests:
        return 0.0

    user_set = set(map(str.lower, user_interests))
    event_set = set(map(str.lower, event_categories))

    overlap = user_set.intersection(event_set)

    return round(len(overlap) / len(user_set), 4)
