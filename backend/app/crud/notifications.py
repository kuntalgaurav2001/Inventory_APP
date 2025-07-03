from sqlalchemy.orm import Session
from app.models.notifications import Notification, NotificationCategory, NotificationPriority, NotificationStatus
from app.schema.notifications import NotificationCreate, NotificationUpdate, NotificationFilter
from typing import List, Optional
import json

def create_notification(db: Session, notification: NotificationCreate, user_id: Optional[str] = None, created_by: Optional[str] = None) -> Notification:
    db_notification = Notification(
        type=notification.type,
        severity=notification.severity,
        message=notification.message,
        category=notification.category,
        priority=notification.priority,
        status=notification.status,
        chemical_id=notification.chemical_id,
        user_id=user_id,
        created_by=created_by,
        recipients=json.dumps(notification.recipients) if notification.recipients else None
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_notifications(db: Session, skip: int = 0, limit: int = 100, user_role: Optional[str] = None, filters: Optional[NotificationFilter] = None) -> List[Notification]:
    query = db.query(Notification)
    
    # Filter by user role if specified
    if user_role:
        query = query.filter(Notification.recipients.contains(user_role))
    
    # Apply additional filters
    if filters:
        if filters.category:
            query = query.filter(Notification.category == filters.category)
        if filters.priority:
            query = query.filter(Notification.priority == filters.priority)
        if filters.status:
            query = query.filter(Notification.status == filters.status)
        if filters.severity:
            query = query.filter(Notification.severity == filters.severity)
        if filters.is_read is not None:
            query = query.filter(Notification.is_read == filters.is_read)
        if filters.is_dismissed is not None:
            query = query.filter(Notification.is_dismissed == filters.is_dismissed)
    
    return query.order_by(Notification.timestamp.desc()).offset(skip).limit(limit).all()

def get_notification(db: Session, notification_id: int) -> Optional[Notification]:
    return db.query(Notification).filter(Notification.id == notification_id).first()

def update_notification(db: Session, notification_id: int, notification_update: NotificationUpdate) -> Optional[Notification]:
    db_notification = get_notification(db, notification_id)
    if db_notification:
        update_data = notification_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_notification, field, value)
        db.commit()
        db.refresh(db_notification)
    return db_notification

def set_delete_comment(db: Session, notification_id: int, comment: str) -> Optional[Notification]:
    db_notification = get_notification(db, notification_id)
    if db_notification:
        db_notification.delete_comment = comment
        db.commit()
        db.refresh(db_notification)
    return db_notification

def delete_notification(db: Session, notification_id: int) -> bool:
    db_notification = get_notification(db, notification_id)
    if not db_notification:
        return False
    db.delete(db_notification)
    db.commit()
    return True

def dismiss_notification(db: Session, notification_id: int) -> Optional[Notification]:
    return update_notification(db, notification_id, NotificationUpdate(is_dismissed=True))

def mark_notification_read(db: Session, notification_id: int) -> Optional[Notification]:
    return update_notification(db, notification_id, NotificationUpdate(is_read=True))

def get_unread_notifications(db: Session, user_role: Optional[str] = None) -> List[Notification]:
    query = db.query(Notification).filter(Notification.is_read == False)
    
    if user_role:
        query = query.filter(Notification.recipients.contains(user_role))
    
    return query.order_by(Notification.timestamp.desc()).all()

def get_active_notifications(db: Session, user_role: Optional[str] = None) -> List[Notification]:
    query = db.query(Notification).filter(Notification.is_dismissed == False)
    
    if user_role:
        query = query.filter(Notification.recipients.contains(user_role))
    
    return query.order_by(Notification.timestamp.desc()).all()

def get_notifications_by_status(db: Session, status: NotificationStatus, user_role: Optional[str] = None) -> List[Notification]:
    query = db.query(Notification).filter(Notification.status == status)
    
    if user_role:
        query = query.filter(Notification.recipients.contains(user_role))
    
    return query.order_by(Notification.timestamp.desc()).all()

def get_notifications_by_priority(db: Session, priority: NotificationPriority, user_role: Optional[str] = None) -> List[Notification]:
    query = db.query(Notification).filter(Notification.priority == priority)
    
    if user_role:
        query = query.filter(Notification.recipients.contains(user_role))
    
    return query.order_by(Notification.timestamp.desc()).all()

def get_notifications_by_category(db: Session, category: NotificationCategory, user_role: Optional[str] = None) -> List[Notification]:
    query = db.query(Notification).filter(Notification.category == category)
    
    if user_role:
        query = query.filter(Notification.recipients.contains(user_role))
    
    return query.order_by(Notification.timestamp.desc()).all() 