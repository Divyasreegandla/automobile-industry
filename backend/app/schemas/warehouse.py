from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class WarehouseBase(BaseModel):
    warehouse_name: str
    location: str
    capacity: int = 0

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    warehouse_name: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[int] = None

class WarehouseResponse(WarehouseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True