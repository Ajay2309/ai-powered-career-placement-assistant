
from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app import models, schemas
from app.security import hash_password


# Create database tables if they do not exist.
Base.metadata.create_all(bind=engine)


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


@app.post(
    "/register",
    response_model=schemas.StudentResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_student(
    student: schemas.StudentCreate,
    db: Session = Depends(get_db),
):
    existing_student = (
        db.query(models.Student)
        .filter(models.Student.email == student.email)
        .first()
    )

    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A student with this email already exists.",
        )

    new_student = models.Student(
        full_name=student.full_name,
        email=student.email,
        password_hash=hash_password(student.password),
        branch=student.branch,
        graduation_year=student.graduation_year,
    )

    try:
        db.add(new_student)
        db.commit()
        db.refresh(new_student)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to register student. Please try again.",
        )

    return new_student
