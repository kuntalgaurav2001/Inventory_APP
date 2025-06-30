from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserInfo(BaseModel):
    id: int
    uid: str
    first_name: str
    last_name: Optional[str] = None
    email: str
    role: str
    
    class Config:
        from_attributes = True

class ActivityLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    description: str
    timestamp: datetime
    note: Optional[str] = None
    user_email: Optional[str] = None  # For easier frontend display
    user_info: Optional[UserInfo] = None  # Full user information

    class Config:
        from_attributes = True

class ActivityLogFilter(BaseModel):
    user_id: Optional[int] = None
    action: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = 50
    offset: int = 0

class ActivityLogListResponse(BaseModel):
    logs: list[ActivityLogResponse]
    total: int
    limit: int
    offset: int

class ActivityLogNote(BaseModel):
    note: str 