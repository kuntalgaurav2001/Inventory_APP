from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class NotificationCategory(str, enum.Enum):
    CHEMICAL = "chemical"
    PRODUCT = "product"
    SAFETY = "safety"
    INVENTORY = "inventory"
    GENERAL = "general"

class NotificationPriority(str, enum.Enum):
    LOW = "low"
    MID = "mid"
    HIGH = "high"

class NotificationStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)  # 'low_stock', 'out_of_stock', 'expiry', etc.
    severity = Column(String, nullable=False)  # 'critical', 'warning', 'info'
    message = Column(Text, nullable=False)
    category = Column(Enum(NotificationCategory), nullable=False, default=NotificationCategory.GENERAL)
    priority = Column(Enum(NotificationPriority), nullable=False, default=NotificationPriority.MID)
    status = Column(Enum(NotificationStatus), nullable=False, default=NotificationStatus.PENDING)
    chemical_id = Column(Integer, ForeignKey("chemical_inventory.id"), nullable=True)
    user_id = Column(String, ForeignKey("users.uid"), nullable=True)
    created_by = Column(String, ForeignKey("users.uid"), nullable=True)  # Who created the notification
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    recipients = Column(Text, nullable=True)  # JSON string of recipient roles
    delete_comment = Column(Text, nullable=True)  # New field for delete comment
    
    # Relationships
    chemical = relationship("ChemicalInventory", foreign_keys=[chemical_id])
    user = relationship("User", foreign_keys=[user_id])
    creator = relationship("User", foreign_keys=[created_by]) 