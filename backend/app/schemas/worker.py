from pydantic import BaseModel, Field, EmailStr
from datetime import date, datetime
from typing import Optional, List
from enum import Enum

class EmploymentStatusEnum(str, Enum):
    ACTIVE = "active"
    ON_LEAVE = "on_leave"
    SUSPENDED = "suspended"
    TERMINATED = "terminated"

class ShiftTypeEnum(str, Enum):
    MORNING = "morning"
    EVENING = "evening"
    NIGHT = "night"
    GENERAL = "general"

# Worker Schemas
class WorkerBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')
    address: Optional[str] = Field(None, max_length=500)
    designation: str = Field(..., min_length=2, max_length=100)
    department_id: int
    joining_date: date
    basic_salary: float = Field(..., ge=0)
    shift_type: ShiftTypeEnum = ShiftTypeEnum.GENERAL
    status: EmploymentStatusEnum = EmploymentStatusEnum.ACTIVE
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class WorkerCreate(WorkerBase):
    pass

class WorkerUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')
    address: Optional[str] = Field(None, max_length=500)
    designation: Optional[str] = Field(None, min_length=2, max_length=100)
    department_id: Optional[int] = None
    basic_salary: Optional[float] = Field(None, ge=0)
    shift_type: Optional[ShiftTypeEnum] = None
    status: Optional[EmploymentStatusEnum] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class WorkerResponse(WorkerBase):
    id: int
    employee_code: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class WorkerWithDepartmentResponse(WorkerResponse):
    department_name: Optional[str] = None
    factory_name: Optional[str] = None