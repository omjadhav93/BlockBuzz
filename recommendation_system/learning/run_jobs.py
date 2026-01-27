from learning.popularity.compute import compute_popularity
from learning.engagement.compute import compute_engagement
from learning.collaborative.similarity import compute_event_similarity
from learning.collaborative.score import compute_collab_scores
from learning.weights.learn import learn_weights

def run_all():
    compute_popularity()
    compute_engagement()
    compute_event_similarity()
    compute_collab_scores()
    learn_weights()   

if __name__ == "__main__":
    run_all()