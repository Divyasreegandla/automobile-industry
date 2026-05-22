from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class InventoryTransactionBase(BaseModel):
    material_id: int
    transaction_type: str  # IN, OUT, RETURN, ADJUST
    quantity: float
    transaction_date: date
    remarks: Optional[str] = None

class InventoryTransactionCreate(InventoryTransactionBase):
    pass

class InventoryTransactionUpdate(BaseModel):
    remarks: Optional[str] = None

class InventoryTransactionResponse(InventoryTransactionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True