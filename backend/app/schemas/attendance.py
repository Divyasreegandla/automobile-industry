from pydantic import BaseModel
from datetime import date, time, datetime
from typing import Optional

class AttendanceBase(BaseModel):
    worker_id: int
    attendance_date: date
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    overtime_hours: float = 0

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    check_out: Optional[time] = None
    overtime_hours: Optional[float] = None

class AttendanceResponse(AttendanceBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True