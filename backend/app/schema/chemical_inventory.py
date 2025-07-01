from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.user import UserRole

# Base schema
class ChemicalInventoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    quantity: float = Field(..., ge=0)
    unit: str = Field(..., min_length=1, max_length=50)
    formulation: Optional[str] = None
    notes: Optional[str] = None
    alert_threshold: Optional[float] = Field(None, ge=0)
    supplier: Optional[str] = None
    location: Optional[str] = None

# Create schema
class ChemicalInventoryCreate(ChemicalInventoryBase):
    pass

# Update schema (all fields optional for partial updates)
class ChemicalInventoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    quantity: Optional[float] = Field(None, ge=0)
    unit: Optional[str] = Field(None, min_length=1, max_length=50)
    formulation: Optional[str] = None
    notes: Optional[str] = None
    alert_threshold: Optional[float] = Field(None, ge=0)
    supplier: Optional[str] = None
    location: Optional[str] = None

# Add note schema (for appending notes)
class ChemicalInventoryAddNote(BaseModel):
    note: str = Field(..., min_length=1)

# User info for response
class UserInfo(BaseModel):
    uid: str
    first_name: str
    last_name: Optional[str] = None
    role: str
    
    class Config:
        from_attributes = True

# Response schema
class ChemicalInventoryResponse(ChemicalInventoryBase):
    id: int
    last_updated: datetime
    updated_by: Optional[str] = None
    updated_by_user: Optional[UserInfo] = None
    
    class Config:
        from_attributes = True

# Response with formulation details
class ChemicalInventoryWithFormulations(ChemicalInventoryResponse):
    formulation_details: List["FormulationDetailsResponse"] = []
    
    class Config:
        from_attributes = True

# Import for forward reference
from app.schema.formulation_details import FormulationDetailsResponse 