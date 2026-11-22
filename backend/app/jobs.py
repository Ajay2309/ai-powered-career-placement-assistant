
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db


router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/", response_model=list[schemas.JobResponse])
def get_all_jobs(db: Session = Depends(get_db)):
    jobs = (
        db.query(models.Job)
        .filter(models.Job.is_active == True)
        .order_by(models.Job.created_at.desc())
        .all()
    )

    return [
        {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "description": job.description,
            "required_skills": [
                skill.strip()
                for skill in job.required_skills.split(",")
                if skill.strip()
            ],
            "employment_type": job.employment_type,
            "is_active": job.is_active,
            "created_at": job.created_at,
        }
        for job in jobs
    ]


@router.get("/{job_id}", response_model=schemas.JobResponse)
def get_job_by_id(
    job_id: int,
    db: Session = Depends(get_db),
):
    job = (
        db.query(models.Job)
        .filter(
            models.Job.id == job_id,
            models.Job.is_active == True,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "description": job.description,
        "required_skills": [
            skill.strip()
            for skill in job.required_skills.split(",")
            if skill.strip()
        ],
        "employment_type": job.employment_type,
        "is_active": job.is_active,
        "created_at": job.created_at,
    }
