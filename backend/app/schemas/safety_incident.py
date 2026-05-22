from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class SafetyIncidentBase(BaseModel):
    worker_id: int
    incident_type: str
    incident_date: date
    severity: str  # low, medium, high, critical
    remarks: Optional[str] = None

class SafetyIncidentCreate(SafetyIncidentBase):
    pass

class SafetyIncidentUpdate(BaseModel):
    remarks: Optional[str] = None
    severity: Optional[str] = None

class SafetyIncidentResponse(SafetyIncidentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True