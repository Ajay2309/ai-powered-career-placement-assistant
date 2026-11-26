
from datetime import datetime
from typing import Optional, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_student
from app import models


router = APIRouter(
    prefix="/applications",
    tags=["Application Tracker"],
)


ApplicationStatus = Literal[
    "Applied",
    "Shortlisted",
    "Interview",
    "Rejected",
    "Selected",
]


class ApplicationCreate(BaseModel):
    job_title: str = Field(..., min_length=1, max_length=150)
    company: str = Field(..., min_length=1, max_length=150)
    location: Optional[str] = None
    job_url: Optional[str] = None
    status: ApplicationStatus = "Applied"
    applied_date: Optional[datetime] = None
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    job_title: Optional[str] = Field(None, max_length=150)
    company: Optional[str] = Field(None, max_length=150)
    location: Optional[str] = None
    job_url: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    applied_date: Optional[datetime] = None
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    job_title: str
    company: str
    location: Optional[str]
    job_url: Optional[str]
    status: str
    applied_date: datetime
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime


def get_student_application(
    application_id: int,
    student_id: int,
    db: Session,
):
    application = (
        db.query(models.JobApplication)
        .filter(
            models.JobApplication.id == application_id,
            models.JobApplication.student_id == student_id,
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        )

    return application


@router.post(
    "/",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_application(
    application_data: ApplicationCreate,
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    new_application = models.JobApplication(
        student_id=current_student.id,
        job_title=application_data.job_title,
        company=application_data.company,
        location=application_data.location,
        job_url=application_data.job_url,
        status=application_data.status,
        applied_date=application_data.applied_date or datetime.utcnow(),
        notes=application_data.notes,
    )

    try:
        db.add(new_application)
        db.commit()
        db.refresh(new_application)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to save application.",
        )

    return new_application


@router.get(
    "/",
    response_model=list[ApplicationResponse],
)
def get_applications(
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    applications = (
        db.query(models.JobApplication)
        .filter(
            models.JobApplication.student_id == current_student.id
        )
        .order_by(models.JobApplication.created_at.desc())
        .all()
    )

    return applications


@router.get("/stats")
def get_application_stats(
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    applications = (
        db.query(models.JobApplication)
        .filter(
            models.JobApplication.student_id == current_student.id
        )
        .all()
    )

    total = len(applications)

    stats = {
        "total": total,
        "Applied": 0,
        "Shortlisted": 0,
        "Interview": 0,
        "Rejected": 0,
        "Selected": 0,
    }

    for application in applications:
        if application.status in stats:
            stats[application.status] += 1

    stats["success_rate"] = (
        round((stats["Selected"] / total) * 100, 2)
        if total > 0
        else 0
    )

    return stats


@router.put(
    "/{application_id}",
    response_model=ApplicationResponse,
)
def update_application(
    application_id: int,
    application_data: ApplicationUpdate,
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    application = get_student_application(
        application_id,
        current_student.id,
        db,
    )

    update_data = application_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(application, field, value)

    application.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(application)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to update application.",
        )

    return application


@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    application = get_student_application(
        application_id,
        current_student.id,
        db,
    )

    try:
        db.delete(application)
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to delete application.",
        )

    return {
        "message": "Application deleted successfully."
    }
