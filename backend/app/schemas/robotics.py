from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from enum import Enum

class RobotStatusEnum(str, Enum):
    OPERATIONAL = "operational"
    CHARGING = "charging"
    MAINTENANCE = "maintenance"
    CALIBRATION = "calibration"
    ERROR = "error"
    IDLE = "idle"

class AutomationTypeEnum(str, Enum):
    ASSEMBLY = "assembly"
    WELDING = "welding"
    PAINTING = "painting"
    PACKAGING = "packaging"
    INSPECTION = "inspection"
    MATERIAL_HANDLING = "material_handling"

class RoboticsBase(BaseModel):
    robot_code: str = Field(..., min_length=2, max_length=50)
    robot_name: str = Field(..., min_length=2, max_length=255)
    automation_type: AutomationTypeEnum
    manufacturer: Optional[str] = Field(None, max_length=255)
    model_number: Optional[str] = Field(None, max_length=100)
    department_id: int
    purchase_date: date
    purchase_cost: float = Field(0, ge=0)
    warranty_expiry: Optional[date] = None
    maintenance_cycle_days: int = Field(90, ge=1)
    current_status: RobotStatusEnum = RobotStatusEnum.OPERATIONAL
    operating_hours: float = Field(0, ge=0)
    energy_consumption: float = Field(0, ge=0)
    last_maintenance_date: Optional[date] = None
    next_maintenance_date: Optional[date] = None
    software_version: Optional[str] = Field(None, max_length=50)
    firmware_version: Optional[str] = Field(None, max_length=50)
    specifications: Optional[str] = None

class RoboticsCreate(RoboticsBase):
    pass

class RoboticsUpdate(BaseModel):
    robot_name: Optional[str] = Field(None, min_length=2, max_length=255)
    department_id: Optional[int] = None
    current_status: Optional[RobotStatusEnum] = None
    operating_hours: Optional[float] = Field(None, ge=0)
    energy_consumption: Optional[float] = Field(None, ge=0)
    last_maintenance_date: Optional[date] = None
    next_maintenance_date: Optional[date] = None
    software_version: Optional[str] = Field(None, max_length=50)
    firmware_version: Optional[str] = Field(None, max_length=50)

class RoboticsResponse(RoboticsBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True