from fastapi import FastAPI
from app.api.recommend import router as recommend_router

app = FastAPI(
    title="Event Recommendation Service",
    version="1.0.0"
)

app.include_router(recommend_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok"}
