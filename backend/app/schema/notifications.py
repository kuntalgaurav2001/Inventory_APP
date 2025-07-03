from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.notifications import NotificationCategory, NotificationPriority, NotificationStatus

class NotificationBase(BaseModel):
    type: str
    severity: str
    message: str
    category: NotificationCategory = NotificationCategory.GENERAL
    priority: NotificationPriority = NotificationPriority.MID
    status: NotificationStatus = NotificationStatus.PENDING
    chemical_id: Optional[int] = None
    recipients: Optional[List[str]] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: int
    user_id: Optional[str] = None
    created_by: Optional[str] = None
    creator_name: Optional[str] = None  # First name + last name of creator
    timestamp: datetime
    is_read: bool
    is_dismissed: bool
    delete_comment: Optional[str] = None
    
    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    status: Optional[NotificationStatus] = None
    is_read: Optional[bool] = None
    is_dismissed: Optional[bool] = None
    delete_comment: Optional[str] = None

class NotificationSend(BaseModel):
    type: str
    severity: str
    message: str
    category: NotificationCategory = NotificationCategory.GENERAL
    priority: NotificationPriority = NotificationPriority.MID
    chemical_id: Optional[int] = None
    timestamp: Optional[datetime] = None
    recipients: List[str] = ['admin', 'product']

class NotificationFilter(BaseModel):
    category: Optional[NotificationCategory] = None
    priority: Optional[NotificationPriority] = None
    status: Optional[NotificationStatus] = None
    severity: Optional[str] = None
    is_read: Optional[bool] = None
    is_dismissed: Optional[bool] = None
    skip: int = 0
    limit: int = 50

class NotificationDeleteRequest(BaseModel):
    delete_comment: Optional[str] = None 