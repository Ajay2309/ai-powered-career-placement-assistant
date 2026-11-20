
from fastapi import FastAPI

app = FastAPI(
    title="AI-Powered Career & Placement Assistant",
    description="An AI-powered platform for career guidance and placement preparation.",
    version="1.0.0",
)


@app.get("/")
def home():
    return {
        "message": "Welcome to AI-Powered Career & Placement Assistant!",
        "status": "Backend is running successfully",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "project": "AI-Powered Career & Placement Assistant",
    }
