
from app.interview import generate_interview_questions

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

from app.analysis import (
    analyze_resume_text,
    calculate_job_match,
    generate_skill_gap_analysis,
)
from app.dependencies import get_current_student


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


@router.get(
    "/recommendations/me",
    response_model=list[schemas.JobMatchResponse],
)
def get_job_recommendations(
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    # Find the student's latest uploaded resume
    latest_resume = (
        db.query(models.Resume)
        .filter(models.Resume.student_id == current_student.id)
        .order_by(models.Resume.uploaded_at.desc())
        .first()
    )

    if latest_resume is None:
        raise HTTPException(
            status_code=404,
            detail="Please upload a resume before requesting job recommendations.",
        )

    # Extract skills from the resume
    resume_analysis = analyze_resume_text(
        latest_resume.extracted_text or ""
    )
    resume_skills = resume_analysis["skills"]

    # Retrieve all active jobs
    jobs = (
        db.query(models.Job)
        .filter(models.Job.is_active == True)
        .all()
    )

    recommendations = []

    for job in jobs:
        required_skills = [
            skill.strip()
            for skill in job.required_skills.split(",")
            if skill.strip()
        ]

        match_result = calculate_job_match(
            resume_skills,
            required_skills,
        )

        recommendations.append({
            "job_id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            **match_result,
        })

    # Sort jobs from highest to lowest compatibility
    recommendations.sort(
        key=lambda item: item["match_percentage"],
        reverse=True,
    )

    return recommendations

@router.get(
    "/{job_id}/skill-gap",
    response_model=schemas.SkillGapResponse,
)
def get_skill_gap_analysis(
    job_id: int,
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    # Get the student's latest uploaded resume.
    latest_resume = (
        db.query(models.Resume)
        .filter(models.Resume.student_id == current_student.id)
        .order_by(models.Resume.uploaded_at.desc())
        .first()
    )

    if latest_resume is None:
        raise HTTPException(
            status_code=404,
            detail="Please upload a resume before requesting skill gap analysis.",
        )

    # Find the selected active job.
    job = (
        db.query(models.Job)
        .filter(
            models.Job.id == job_id,
            models.Job.is_active.is_(True),
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found.",
        )

    # Extract skills from the resume.
    resume_skills = analyze_resume_text(
        latest_resume.extracted_text or ""
    )["skills"]

    # Extract required skills from the job.
    required_skills = [
        skill.strip()
        for skill in job.required_skills.split(",")
        if skill.strip()
    ]

    # Generate the skill gap report.
    analysis = generate_skill_gap_analysis(
        resume_skills,
        required_skills,
    )

    return {
        "job_id": job.id,
        "job_title": job.title,
        "company": job.company,
        **analysis,
    }


@router.get(
    "/{job_id}/interview-questions",
    response_model=schemas.InterviewResponse,
)
def get_interview_questions(
    job_id: int,
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    # Find the student's latest uploaded resume.
    latest_resume = (
        db.query(models.Resume)
        .filter(models.Resume.student_id == current_student.id)
        .order_by(models.Resume.uploaded_at.desc())
        .first()
    )

    if latest_resume is None:
        raise HTTPException(
            status_code=404,
            detail="Please upload a resume before generating interview questions.",
        )

    # Find the selected active job.
    job = (
        db.query(models.Job)
        .filter(
            models.Job.id == job_id,
            models.Job.is_active.is_(True),
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found.",
        )

    # Extract skills from the student's resume.
    resume_skills = analyze_resume_text(
        latest_resume.extracted_text or ""
    )["skills"]

    # Extract required skills from the job.
    required_skills = [
        skill.strip()
        for skill in job.required_skills.split(",")
        if skill.strip()
    ]

    # Generate personalized interview questions.
    interview_result = generate_interview_questions(
        resume_skills=resume_skills,
        required_skills=required_skills,
        job_title=job.title,
    )

    return {
        "job_id": job.id,
        "job_title": job.title,
        "company": job.company,
        **interview_result,
    }

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
