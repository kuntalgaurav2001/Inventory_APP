from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.firebase_auth import get_current_user
from app.crud import notifications as crud_notifications
from app.crud import user as crud_users
from app.schema.notifications import NotificationCreate, NotificationResponse, NotificationUpdate, NotificationSend, NotificationFilter, NotificationDeleteRequest
from app.models.notifications import NotificationCategory, NotificationPriority, NotificationStatus
from typing import List, Optional
import json

router = APIRouter(tags=["notifications"])

def enrich_notification_response(notification, db: Session) -> dict:
    """Enrich notification response with creator information"""
    response_data = {
        "id": notification.id,
        "type": notification.type,
        "severity": notification.severity,
        "message": notification.message,
        "category": notification.category,
        "priority": notification.priority,
        "status": notification.status,
        "chemical_id": notification.chemical_id,
        "user_id": notification.user_id,
        "created_by": notification.created_by,
        "timestamp": notification.timestamp,
        "is_read": notification.is_read,
        "is_dismissed": notification.is_dismissed,
        "recipients": json.loads(notification.recipients) if notification.recipients else []
    }
    
    # Add creator name if available
    if notification.created_by:
        creator = crud_users.get_user_by_uid(db, notification.created_by)
        if creator:
            response_data["creator_name"] = f"{creator.first_name} {creator.last_name or ''}".strip()
    
    return response_data

@router.post("/send", response_model=NotificationResponse)
def send_notification(
    notification: NotificationSend,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a notification to specified recipients"""
    try:
        # Create notification for each recipient role
        notifications = []
        for recipient_role in notification.recipients:
            notification_data = NotificationCreate(
                type=notification.type,
                severity=notification.severity,
                message=notification.message,
                category=notification.category,
                priority=notification.priority,
                chemical_id=notification.chemical_id,
                recipients=[recipient_role]
            )
            db_notification = crud_notifications.create_notification(
                db, notification_data, current_user.uid, current_user.uid
            )
            notifications.append(db_notification)
        
        # Return the first notification enriched with creator info
        if notifications:
            return enrich_notification_response(notifications[0], db)
        return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send notification: {str(e)}"
        )

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[NotificationCategory] = Query(None),
    priority: Optional[NotificationPriority] = Query(None),
    status: Optional[NotificationStatus] = Query(None),
    severity: Optional[str] = Query(None),
    is_read: Optional[bool] = Query(None),
    is_dismissed: Optional[bool] = Query(None),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notifications for the current user's role with filters"""
    try:
        # Get user role from the database
        user_info = crud_users.get_user_by_uid(db, current_user.uid)
        user_role = user_info.role if user_info else "all_users"

        # Only filter by user_role if not admin
        role_filter = None if user_role == "admin" else user_role

        # Create filter object
        filters = NotificationFilter(
            category=category,
            priority=priority,
            status=status,
            severity=severity,
            is_read=is_read,
            is_dismissed=is_dismissed,
            skip=skip,
            limit=limit
        )

        notifications = crud_notifications.get_notifications(
            db, skip=skip, limit=limit, user_role=role_filter, filters=filters
        )

        # Enrich responses with creator information
        enriched_notifications = []
        for notification in notifications:
            enriched_notifications.append(enrich_notification_response(notification, db))

        return enriched_notifications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {str(e)}"
        )

@router.get("/unread", response_model=List[NotificationResponse])
def get_unread_notifications(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get unread notifications for the current user's role"""
    try:
        user_info = crud_users.get_user_by_uid(db, current_user.uid)
        user_role = user_info.role if user_info else "all_users"
        
        notifications = crud_notifications.get_unread_notifications(db, user_role)
        
        # Enrich responses with creator information
        enriched_notifications = []
        for notification in notifications:
            enriched_notifications.append(enrich_notification_response(notification, db))
        
        return enriched_notifications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch unread notifications: {str(e)}"
        )

@router.get("/active", response_model=List[NotificationResponse])
def get_active_notifications(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get active (non-dismissed) notifications for the current user's role"""
    try:
        user_info = crud_users.get_user_by_uid(db, current_user.uid)
        user_role = user_info.role if user_info else "all_users"
        
        notifications = crud_notifications.get_active_notifications(db, user_role)
        
        # Enrich responses with creator information
        enriched_notifications = []
        for notification in notifications:
            enriched_notifications.append(enrich_notification_response(notification, db))
        
        return enriched_notifications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch active notifications: {str(e)}"
        )

@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(
    notification_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific notification by ID"""
    notification = crud_notifications.get_notification(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return enrich_notification_response(notification, db)

@router.put("/{notification_id}", response_model=NotificationResponse)
def update_notification(
    notification_id: int,
    notification_update: NotificationUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a notification"""
    notification = crud_notifications.update_notification(db, notification_id, notification_update)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return enrich_notification_response(notification, db)

@router.post("/{notification_id}/dismiss", response_model=NotificationResponse)
def dismiss_notification(
    notification_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dismiss a notification"""
    notification = crud_notifications.dismiss_notification(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return enrich_notification_response(notification, db)

@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    notification = crud_notifications.mark_notification_read(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return enrich_notification_response(notification, db)

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    request: NotificationDeleteRequest = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a notification (admin or responsible team with comment)"""
    notification = crud_notifications.get_notification(db, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    user_info = crud_users.get_user_by_uid(db, current_user.uid)
    user_role = user_info.role if user_info else None
    recipients = []
    try:
        recipients = json.loads(notification.recipients) if notification.recipients else []
    except Exception:
        pass

    # Admin can delete any notification
    if user_role == "admin":
        crud_notifications.delete_notification(db, notification_id)
        return {"message": "Notification deleted by admin."}

    # Responsible team can delete with comment
    if user_role in recipients:
        if not request or not request.delete_comment or not request.delete_comment.strip():
            raise HTTPException(status_code=400, detail="A comment is required to delete this notification.")
        # Store the comment before deletion
        crud_notifications.set_delete_comment(db, notification_id, request.delete_comment.strip())
        crud_notifications.delete_notification(db, notification_id)
        return {"message": f"Notification deleted by {user_role}.", "delete_comment": request.delete_comment.strip()}

    raise HTTPException(status_code=403, detail="You do not have permission to delete this notification.")

@router.get("/categories/list")
def get_notification_categories():
    """Get list of available notification categories"""
    return [{"value": cat.value, "label": cat.value.replace("_", " ").title()} for cat in NotificationCategory]

@router.get("/priorities/list")
def get_notification_priorities():
    """Get list of available notification priorities"""
    return [{"value": pri.value, "label": pri.value.upper()} for pri in NotificationPriority]

@router.get("/statuses/list")
def get_notification_statuses():
    """Get list of available notification statuses"""
    return [{"value": status.value, "label": status.value.replace("_", " ").title()} for status in NotificationStatus] 