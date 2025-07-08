from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud.user import get_user_by_id, get_user_by_uid, update_user_last_seen, set_user_online, set_user_offline
from app.crud.activity_log import get_user_activity_logs, create_activity_log
from app.schema.user import DashboardResponse, UserResponse
from app.schema.activity_log import ActivityLogResponse
from app.firebase_auth import get_approved_user, get_firebase_token
from app.models.user import UserRole
from typing import List
import logging
from datetime import datetime

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user = Depends(get_approved_user)
):
    """Get current user information (approved users only)"""
    logger.info(f"[{datetime.now().isoformat()}] User {current_user.uid} ({current_user.email}) requested current user info")
    return current_user

@router.post("/ping")
async def update_last_seen(
    current_user = Depends(get_approved_user),
    db: Session = Depends(get_db)
):
    """Update user's last seen timestamp (heartbeat)"""
    logger.info(f"[{datetime.now().isoformat()}] Heartbeat from user {current_user.uid} ({current_user.email})")
    
    updated_user = update_user_last_seen(db, current_user.id)
    if not updated_user:
        logger.warning(f"[{datetime.now().isoformat()}] User {current_user.uid} not found for heartbeat update")
        raise HTTPException(status_code=404, detail="User not found")
    
    logger.info(f"[{datetime.now().isoformat()}] Heartbeat updated successfully for user {current_user.uid} ({current_user.email})")
    return {"message": "Last seen updated", "last_seen": updated_user.last_seen}

@router.get("/status")
async def get_user_status(
    token: dict = Depends(get_firebase_token),
    db: Session = Depends(get_db)
):
    """Get user status (works for both approved and pending users)"""
    logger.info(f"[{datetime.now().isoformat()}] Status check for user {token['uid']}")
    
    user = get_user_by_uid(db, token["uid"])
    if not user:
        logger.warning(f"[{datetime.now().isoformat()}] User {token['uid']} not found for status check")
        raise HTTPException(status_code=404, detail="User not found")
    
    logger.info(f"[{datetime.now().isoformat()}] Status returned for user {token['uid']} ({user.email}) - Approved: {user.is_approved}, Role: {user.role}")
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "is_approved": user.is_approved,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }

@router.get("/dashboard", response_model=DashboardResponse)
async def get_user_dashboard(
    current_user = Depends(get_approved_user)
):
    """Get user-specific dashboard data"""
    logger.info(f"[{datetime.now().isoformat()}] Dashboard request from user {current_user.uid} ({current_user.email}) with role {current_user.role}")
    
    # Define permissions based on role
    permissions = []
    
    if current_user.role == UserRole.ADMIN:
        permissions = [
            "manage_users", "manage_invitations", "view_logs", 
            "approve_users", "delete_users", "modify_users","view_inventory", "add_chemicals", "update_chemicals",
            "view_reports", "manage_safety_data","manage_accounts","view_financial_data"
        ]
    elif current_user.role == UserRole.LAB_STAFF:
        permissions = [
            "view_inventory", "add_chemicals", "update_chemicals",
            "view_reports", "manage_safety_data"
        ]
    elif current_user.role == UserRole.PRODUCT:
        permissions = [
            "view_inventory", "view_reports", "export_data",
            "manage_product_info"
        ]
    elif current_user.role == UserRole.ACCOUNT:
        permissions = [
            "view_inventory", "view_reports", "manage_accounts",
            "view_financial_data"
        ]
    elif current_user.role == UserRole.ALL_USERS:
        permissions = [
            "view_inventory", "view_reports", "basic_access"
        ]
    
    logger.info(f"[{datetime.now().isoformat()}] Dashboard returned for user {current_user.uid} ({current_user.email}) with {len(permissions)} permissions")
    return DashboardResponse(
        user=current_user,
        role=current_user.role,
        permissions=permissions
    )

@router.get("/activity", response_model=List[ActivityLogResponse])
async def get_user_activity(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user = Depends(get_approved_user)
):
    """Get current user's activity logs"""
    logger.info(f"[{datetime.now().isoformat()}] User {current_user.uid} ({current_user.email}) requested activity logs (limit: {limit})")
    
    logs = get_user_activity_logs(db, current_user.id, limit=limit)
    
    # Convert to response format
    response_logs = []
    for log in logs:
        response_logs.append(ActivityLogResponse(
            id=log.id,
            user_id=log.user_id,
            action=log.action,
            description=log.description,
            timestamp=log.timestamp,
            note=log.note,
            user_email=current_user.email
        ))
    
    logger.info(f"[{datetime.now().isoformat()}] Retrieved {len(response_logs)} activity logs for user {current_user.uid} ({current_user.email})")
    return response_logs

@router.post("/online")
async def set_online(
    current_user = Depends(get_approved_user),
    db: Session = Depends(get_db)
):
    """Set user as online and log the event"""
    logger.info(f"[{datetime.now().isoformat()}] User {current_user.uid} ({current_user.email}) setting status to ONLINE")
    
    user = set_user_online(db, current_user.id)
    if not user:
        logger.warning(f"[{datetime.now().isoformat()}] User {current_user.uid} not found for online status update")
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log the online status change
    create_activity_log(
        db=db,
        user_id=current_user.id,
        action="user_online",
        description=f"User {current_user.email} went online",
        note=f"User {current_user.email} ({current_user.role}) is now online"
    )
    
    logger.info(f"[{datetime.now().isoformat()}] User {current_user.uid} ({current_user.email}) is now ONLINE")
    return {"message": "User set as online", "is_online": user.is_online}

@router.post("/offline")
async def set_offline(
    current_user = Depends(get_approved_user),
    db: Session = Depends(get_db)
):
    """Set user as offline and log the event"""
    logger.info(f"[{datetime.now().isoformat()}] User {current_user.uid} ({current_user.email}) setting status to OFFLINE")
    
    user = set_user_offline(db, current_user.id)
    if not user:
        logger.warning(f"[{datetime.now().isoformat()}] User {current_user.uid} not found for offline status update")
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log the offline status change
    create_activity_log(
        db=db,
        user_id=current_user.id,
        action="user_offline",
        description=f"User {current_user.email} went offline",
        note=f"User {current_user.email} ({current_user.role}) is now offline"
    )
    
    logger.info(f"[{datetime.now().isoformat()}] User {current_user.uid} ({current_user.email}) is now OFFLINE")
    return {"message": "User set as offline", "is_online": user.is_online} 