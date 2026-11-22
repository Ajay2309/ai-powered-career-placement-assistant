import os
import uuid

import fitz
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.dependencies import get_current_student


router = APIRouter(prefix="/resume", tags=["Resume"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed.",
        )

    file_content = await file.read()

    if not file_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if len(file_content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size must not exceed 5 MB.",
        )

    unique_filename = f"{uuid.uuid4()}.pdf"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with fitz.open(stream=file_content, filetype="pdf") as pdf:
            extracted_text = "\n".join(
                page.get_text() for page in pdf
            )

        if not extracted_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No readable text found in the PDF.",
            )

        with open(file_path, "wb") as uploaded_file:
            uploaded_file.write(file_content)

        new_resume = models.Resume(
            student_id=current_student.id,
            file_name=file.filename or "resume.pdf",
            file_path=file_path,
            extracted_text=extracted_text,
        )

        db.add(new_resume)
        db.commit()
        db.refresh(new_resume)

        return {
            "message": "Resume uploaded successfully.",
            "resume_id": new_resume.id,
            "file_name": new_resume.file_name,
            "uploaded_at": new_resume.uploaded_at,
        }

    except HTTPException:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise

    except Exception:
        db.rollback()

        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Resume upload failed. Please try again.",
        )