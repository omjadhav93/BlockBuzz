def explain_event(breakdown: dict) -> list[str]:
    explanations = []

    for feature, data in breakdown.items():
        if data["contribution"] <= 0:
            continue

        explanations.append(
            f"{feature.replace('_', ' ').title()} contributed {data['contribution']}"
        )

    return explanations
