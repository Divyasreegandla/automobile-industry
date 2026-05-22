from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from enum import Enum

class MaintenanceTypeEnum(str, Enum):
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    EMERGENCY = "emergency"
    CALIBRATION = "calibration"
    UPGRADE = "upgrade"

class MaintenanceLogBase(BaseModel):
    machine_id: Optional[int] = None
    robot_id: Optional[int] = None
    maintenance_type: MaintenanceTypeEnum
    maintenance_date: date
    technician_name: str = Field(..., min_length=2, max_length=255)
    technician_contact: Optional[str] = None
    description: Optional[str] = None
    maintenance_cost: float = Field(0, ge=0)
    parts_replaced: Optional[str] = None
    downtime_hours: float = Field(0, ge=0)
    next_maintenance_due: Optional[date] = None
    remarks: Optional[str] = None

class MaintenanceLogCreate(MaintenanceLogBase):
    pass

class MaintenanceLogUpdate(BaseModel):
    maintenance_cost: Optional[float] = Field(None, ge=0)
    downtime_hours: Optional[float] = Field(None, ge=0)
    remarks: Optional[str] = None

class MaintenanceLogResponse(MaintenanceLogBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True