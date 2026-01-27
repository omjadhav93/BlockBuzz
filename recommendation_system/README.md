# 🎯 Event Recommendation System

A robust, hybrid recommendation engine designed to deliver personalized event discovery. It balances proximity, user interests, and global trends with advanced collaborative filtering and real-time explanation capabilities.

---

## 🚀 Overview

This system provides a state-of-the-art recommendation pipeline that processes user-event interactions to generate highly relevant rankings. It features a dual-layer architecture: a **Real-Time Scoring API** for instant delivery and a **Learning Pipeline** for background model updates.

### Key Highlights
- **Hybrid Scoring Engine**: Combines geospatial proximity, interest overlap, and behavioral signals.
- **Explainable AI**: Provides transparency by breaking down exactly why an event was recommended.
- **Exploration & Discovery**: Implements an epsilon-greedy strategy to prevent "echo chambers" and surface new content.
- **Automated Learning**: Weekly/Daily jobs to update collaborative filtering matrices and feature weights.

---

## 📂 Project Structure

```bash
recommendation_system/
├── app/                  # Real-time API & Core Logic
│   ├── api/             # FastAPI Endpoints
│   ├── core/            # Config, Weights & System Settings
│   ├── models/          # Pydantic Schemas (Request/Response)
│   ├── scoring/         # Scoring Algorithms (Interest, Distance, Time)
│   └── utils/           # Data Loaders
├── learning/            # Background Processing & ML
│   ├── collaborative/   # Matrix Factorization & Similarity
│   ├── popularity/      # Global Trend Computation
│   ├── engagement/      # User Engagement Scoring
│   ├── weights/         # Optimization of Feature Weights
│   └── run_jobs.py      # Orchestrator for Learning Tasks
└── storage/             # Persistence Layer (JSON stores)
    ├── interactions.json    # raw user-event data
    ├── collab_scores.json   # pre-computed CF scores
    └── learned_weights.json # optimized feature weights
```

---

## ⚙️ How it Works

### 1. The Scoring Pipeline
When a request hits `/api/recommend`, the system evaluates each event against 8 core signals:

| Signal | Description | Logic |
| :--- | :--- | :--- |
| **Distance** | Geospatial proximity | Haversine distance with linear decay |
| **Interest** | Category alignment | Jaccard similarity between user and event tags |
| **Time** | Recency/Relevancy | Time-decay scoring based on start date |
| **Popularity** | Global trend | Normalized engagement across all users |
| **Collaborative**| Personal similarity| User-User / Item-Item similarity scores |
| **Host** | Host reputation | Pre-computed host quality score |
| **Trust** | Safety signal | Verification and trust metrics |
| **Engagement** | User activity | Personalized multiplier based on historical activity |

### 2. Feature Weighting
Weights are dynamic. While a default set exists, the `learning/` module periodically optimizes these weights based on actual conversion data, ensuring the system adapts to changing user behavior.

### 3. Explainability
If `ENABLE_EXPLANATION` is set to `True` in `settings.py`, every recommendation includes a human-readable breakdown:
> *"Interest contributed 0.35, Distance contributed 0.22..."*

---

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.9+
- FastAPI
- Uvicorn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd recommendation_system
   ```
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn pydantic
   ```

### Running the API
Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.

### Running Learning Jobs
To update models and refresh scores:
```bash
python -m learning.run_jobs
```

---

## 📡 API Reference

### POST `/api/recommend`
Generates a ranked list of events for a specific user.

**Request Body:**
```json
{
  "user": {
    "user_id": "u123",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "interests": ["Music", "Tech"]
  },
  "events": [
    {
      "event_id": "e1",
      "latitude": 40.7306,
      "longitude": -73.9352,
      "category": ["Music"],
      "start_time": "2024-06-01T19:00:00"
    }
  ]
}
```

---

## 🧪 Development
- **Enable Debugging**: Set `ENABLE_EXPLANATION = True` in `app/core/settings.py` to see internal score breakdowns.
- **Adjust Exploration**: Modify `EXPLORATION_RATE` in `app/api/recommend.py` to tune the randomness vs. precision balance (default 10%).


