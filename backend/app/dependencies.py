
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth import decode_access_token
from app.database import get_db
from app import models


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_current_student(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        student_id = payload.get("sub")

        if student_id is None:
            raise credentials_exception

        student_id = int(student_id)

    except (Exception):
        raise credentials_exception

    student = (
        db.query(models.Student)
        .filter(models.Student.id == student_id)
        .first()
    )

    if student is None:
        raise credentials_exception

    return student
