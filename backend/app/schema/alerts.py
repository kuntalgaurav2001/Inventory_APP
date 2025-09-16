from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.alerts import AlertSeverity, AlertType

class AlertBase(BaseModel):
    type: AlertType
    severity: AlertSeverity
    message: str
    chemical_id: Optional[int] = None

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    user_id: Optional[str] = None
    timestamp: datetime
    is_read: bool
    is_dismissed: bool
    
    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    is_read: Optional[bool] = None
    is_dismissed: Optional[bool] = None

class AlertFilter(BaseModel):
    type: Optional[AlertType] = None
    severity: Optional[AlertSeverity] = None
    is_read: Optional[bool] = None
    is_dismissed: Optional[bool] = None
    chemical_id: Optional[int] = None
    skip: int = 0
    limit: int = 50 
