from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class FactoryExpenseBase(BaseModel):
    expense_type: str
    amount: float = 0
    expense_date: date
    remarks: Optional[str] = None

class FactoryExpenseCreate(FactoryExpenseBase):
    pass

class FactoryExpenseUpdate(BaseModel):
    expense_type: Optional[str] = None
    amount: Optional[float] = None
    remarks: Optional[str] = None

class FactoryExpenseResponse(FactoryExpenseBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True