
from fastapi import FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.database import engine

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


@app.get("/db-health")
def database_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "connected",
            "database": "career_placement_db",
            "message": "PostgreSQL connection successful!",
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Database connection failed. Check your database settings.",
        )
