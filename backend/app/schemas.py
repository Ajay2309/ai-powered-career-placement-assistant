
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class StudentCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    branch: str | None = Field(default=None, max_length=50)
    graduation_year: int | None = Field(default=None, ge=2020, le=2100)


class StudentResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    branch: str | None
    graduation_year: int | None

    model_config = {"from_attributes": True}


class StudentLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class StudentUpdate(BaseModel):
    full_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    branch: str | None = Field(
        default=None,
        max_length=50,
    )
    graduation_year: int | None = Field(
        default=None,
        ge=2020,
        le=2100,
    )

class StudentDashboardResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    branch: str | None
    graduation_year: int | None
    created_at: datetime

class ResumeAnalysisResponse(BaseModel):
    resume_id: int
    file_name: str
    skills: list[str]
    total_skills: int
    word_count: int
    suggestions: list[str]

class JobCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    company: str = Field(min_length=2, max_length=150)
    location: str | None = Field(default=None, max_length=150)
    description: str = Field(min_length=10)
    required_skills: list[str] = Field(min_length=1)
    employment_type: str | None = Field(default=None, max_length=50)


class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str | None
    description: str
    required_skills: list[str]
    employment_type: str | None
    is_active: bool
    created_at: datetime


class JobMatchResponse(BaseModel):
    job_id: int
    title:  str
    company: str
    location: str | None
    match_percentage: int
    matched_skills: list[str]
    missing_skills: list[str]


class SkillRecommendation(BaseModel):
    skill: str
    recommendation: str


class SkillGapResponse(BaseModel):
    job_id: int
    job_title: str
    company: str
    match_percentage: int
    matched_skills: list[str]
    missing_skills: list[str]
    learning_recommendations: list[SkillRecommendation]
