
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Notification
from app.dependencies import get_current_student


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student)
):
    return (
        db.query(Notification)
        .filter(Notification.student_id == current_student.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.get("/stats")
def get_notification_stats(
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student)
):
    notifications = (
        db.query(Notification)
        .filter(Notification.student_id == current_student.id)
        .all()
    )

    total = len(notifications)
    unread = sum(not notification.is_read for notification in notifications)

    return {
        "total": total,
        "unread": unread,
        "read": total - unread
    }


@router.post("/")
def create_notification(
    title: str,
    message: str,
    notification_type: str = "general",
    reminder_date: datetime = None,
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student)
):
    notification = Notification(
        student_id=current_student.id,
        title=title,
        message=message,
        notification_type=notification_type,
        reminder_date=reminder_date
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student)
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.student_id == current_student.id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return {
        "message": "Notification marked as read",
        "notification": notification
    }


@router.put("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student)
):
    notifications = (
        db.query(Notification)
        .filter(
            Notification.student_id == current_student.id,
            Notification.is_read == False
        )
        .all()
    )

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return {
        "message": "All notifications marked as read",
        "updated": len(notifications)
    }


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student)
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.student_id == current_student.id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    db.delete(notification)
    db.commit()

    return {"message": "Notification deleted successfully"}


@router.delete("/")
def delete_all_notifications(
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student)
):
    notifications = (
        db.query(Notification)
        .filter(Notification.student_id == current_student.id)
        .all()
    )

    count = len(notifications)

    for notification in notifications:
        db.delete(notification)

    db.commit()

    return {
        "message": "All notifications deleted",
        "deleted": count
    }
