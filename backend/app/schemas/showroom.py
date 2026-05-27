from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ShowroomBase(BaseModel):
    showroom_code: str = Field(..., min_length=2, max_length=50)
    showroom_name: str = Field(..., min_length=2, max_length=255)
    state: str = Field(..., min_length=2, max_length=100)
    city: str = Field(..., min_length=2, max_length=100)
    address: Optional[str] = None
    manager_name: str = Field(..., min_length=2, max_length=255)
    contact_number: str = Field(..., min_length=10, max_length=20)

class ShowroomCreate(ShowroomBase):
    pass

class ShowroomUpdate(BaseModel):
    showroom_name: Optional[str] = None
    manager_name: Optional[str] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None

class ShowroomResponse(ShowroomBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True