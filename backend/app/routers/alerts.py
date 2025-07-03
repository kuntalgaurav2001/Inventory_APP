from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.firebase_auth import get_current_user
from app.crud import alerts as crud_alerts
from app.schema.alerts import AlertCreate, AlertResponse, AlertUpdate, AlertFilter
from app.models.alerts import AlertType, AlertSeverity
from typing import List, Optional

router = APIRouter(tags=["alerts"])

@router.get("/", response_model=List[AlertResponse])
def get_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    type: Optional[AlertType] = Query(None),
    severity: Optional[AlertSeverity] = Query(None),
    is_read: Optional[bool] = Query(None),
    is_dismissed: Optional[bool] = Query(None),
    chemical_id: Optional[int] = Query(None),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get alerts with filters"""
    try:
        filters = AlertFilter(
            type=type,
            severity=severity,
            is_read=is_read,
            is_dismissed=is_dismissed,
            chemical_id=chemical_id,
            skip=skip,
            limit=limit
        )

        alerts = crud_alerts.get_alerts(db, skip=skip, limit=limit, filters=filters)
        return alerts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch alerts: {str(e)}"
        )

@router.get("/unread", response_model=List[AlertResponse])
def get_unread_alerts(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get unread alerts"""
    try:
        alerts = crud_alerts.get_unread_alerts(db)
        return alerts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch unread alerts: {str(e)}"
        )

@router.get("/active", response_model=List[AlertResponse])
def get_active_alerts(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get active (non-dismissed) alerts"""
    try:
        alerts = crud_alerts.get_active_alerts(db)
        return alerts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch active alerts: {str(e)}"
        )

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific alert by ID"""
    alert = crud_alerts.get_alert(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    return alert

@router.put("/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: int,
    alert_update: AlertUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an alert"""
    alert = crud_alerts.update_alert(db, alert_id, alert_update)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    return alert

@router.post("/{alert_id}/dismiss", response_model=AlertResponse)
def dismiss_alert(
    alert_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dismiss an alert"""
    alert = crud_alerts.dismiss_alert(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    return alert

@router.post("/{alert_id}/read", response_model=AlertResponse)
def mark_alert_read(
    alert_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark an alert as read"""
    alert = crud_alerts.mark_alert_read(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    return alert

@router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an alert (admin only)"""
    from app.crud import user as crud_users
    user_info = crud_users.get_user_by_uid(db, current_user.uid)
    if not user_info or user_info.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete alerts")
    
    success = crud_alerts.delete_alert(db, alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"message": "Alert deleted successfully"}

@router.get("/types/list")
def get_alert_types():
    """Get list of available alert types"""
    return [{"value": alert_type.value, "label": alert_type.value.replace("_", " ").title()} for alert_type in AlertType]

@router.get("/severities/list")
def get_alert_severities():
    """Get list of available alert severities"""
    return [{"value": severity.value, "label": severity.value.upper()} for severity in AlertSeverity] 