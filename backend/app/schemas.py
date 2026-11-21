
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
