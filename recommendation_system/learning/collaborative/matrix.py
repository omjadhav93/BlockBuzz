from collections import defaultdict
from learning.interactions.loader import load_interactions

ACTION_WEIGHT = {
    "VIEW": 1,
    "SAVE": 3,
    "REGISTER": 4,
    "ATTENDED": 5
}

def build_user_event_matrix():
    """
    Returns:
    {
      user_id: { event_id: weight }
    }
    """
    interactions = load_interactions()
    matrix = defaultdict(lambda: defaultdict(float))

    for i in interactions:
        user = i["user_id"]
        event = i["event_id"]
        weight = ACTION_WEIGHT.get(i["action"], 0)
        matrix[user][event] += weight

    return matrix
