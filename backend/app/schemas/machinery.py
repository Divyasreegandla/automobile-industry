from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from enum import Enum

class MachineStatusEnum(str, Enum):
    OPERATIONAL = "operational"
    MAINTENANCE = "maintenance"
    REPAIR = "repair"
    IDLE = "idle"
    DECOMMISSIONED = "decommissioned"

class MachineryBase(BaseModel):
    machine_code: str = Field(..., min_length=2, max_length=50)
    machine_name: str = Field(..., min_length=2, max_length=255)
    machine_type: str = Field(..., min_length=2, max_length=100)
    manufacturer: Optional[str] = Field(None, max_length=255)
    model_number: Optional[str] = Field(None, max_length=100)
    department_id: int
    purchase_date: date
    purchase_cost: float = Field(0, ge=0)
    warranty_expiry: Optional[date] = None
    maintenance_cycle_days: int = Field(30, ge=1)
    current_status: MachineStatusEnum = MachineStatusEnum.OPERATIONAL
    running_hours: float = Field(0, ge=0)
    last_maintenance_date: Optional[date] = None
    next_maintenance_date: Optional[date] = None
    specifications: Optional[str] = None

class MachineryCreate(MachineryBase):
    pass

class MachineryUpdate(BaseModel):
    machine_name: Optional[str] = Field(None, min_length=2, max_length=255)
    machine_type: Optional[str] = Field(None, min_length=2, max_length=100)
    department_id: Optional[int] = None
    current_status: Optional[MachineStatusEnum] = None
    running_hours: Optional[float] = Field(None, ge=0)
    last_maintenance_date: Optional[date] = None
    next_maintenance_date: Optional[date] = None

class MachineryResponse(MachineryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True