from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class PayrollBase(BaseModel):
    worker_id: int
    basic_salary: float = 0
    overtime_amount: float = 0
    deductions: float = 0
    final_salary: float = 0
    payment_status: str = "pending"
    payment_date: Optional[date] = None

class PayrollCreate(PayrollBase):
    pass

class PayrollUpdate(BaseModel):
    payment_status: Optional[str] = None
    payment_date: Optional[date] = None
    deductions: Optional[float] = None
    overtime_amount: Optional[float] = None
    final_salary: Optional[float] = None

class PayrollResponse(PayrollBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True