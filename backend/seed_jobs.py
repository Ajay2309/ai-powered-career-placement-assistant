
from app import models
from app.database import Base, engine, SessionLocal

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

sample_jobs = [
    {
        "title": "Python Developer",
        "company": "Tech Solutions",
        "location": "Bengaluru",
        "description": "Develop backend applications and REST APIs using Python.",
        "required_skills": ["Python", "FastAPI", "SQL", "Git"],
        "employment_type": "Full-time",
    },
    {
        "title": "Frontend Developer",
        "company": "Web Innovations",
        "location": "Hyderabad",
        "description": "Build responsive and interactive web applications.",
        "required_skills": ["HTML", "CSS", "JavaScript", "React"],
        "employment_type": "Full-time",
    },
    {
        "title": "Machine Learning Intern",
        "company": "AI Research Labs",
        "location": "Remote",
        "description": "Assist with machine learning models and data analysis.",
        "required_skills": ["Python", "Machine Learning", "Pandas", "NumPy"],
        "employment_type": "Internship",
    },
]

db = SessionLocal()

try:
    added_count = 0

    for job_data in sample_jobs:
        existing_job = (
            db.query(models.Job)
            .filter(
                models.Job.title == job_data["title"],
                models.Job.company == job_data["company"],
            )
            .first()
        )

        if existing_job:
            continue

        new_job = models.Job(
            title=job_data["title"],
            company=job_data["company"],
            location=job_data["location"],
            description=job_data["description"],
            required_skills=", ".join(job_data["required_skills"]),
            employment_type=job_data["employment_type"],
        )

        db.add(new_job)
        added_count += 1

    db.commit()

    print(f"Successfully added {added_count} sample jobs.")

except Exception:
    db.rollback()
    raise

finally:
    db.close()
