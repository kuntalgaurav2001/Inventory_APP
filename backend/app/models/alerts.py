from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class AlertSeverity(str, enum.Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"

class AlertType(str, enum.Enum):
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"
    EXPIRY = "expiry"
    SYSTEM = "system"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(AlertType), nullable=False)
    severity = Column(Enum(AlertSeverity), nullable=False)
    message = Column(Text, nullable=False)
    chemical_id = Column(Integer, ForeignKey("chemical_inventory.id"), nullable=True)
    user_id = Column(String, ForeignKey("users.uid"), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    is_dismissed = Column(Boolean, default=False)
    is_read = Column(Boolean, default=False)
    
    # Relationships
    chemical = relationship("ChemicalInventory", foreign_keys=[chemical_id])
    user = relationship("User", foreign_keys=[user_id]) 