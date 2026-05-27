from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional

class DealerBase(BaseModel):
    dealer_code: str = Field(..., min_length=2, max_length=50)
    dealer_name: str = Field(..., min_length=2, max_length=255)
    showroom_id: int
    state: str = Field(..., min_length=2, max_length=100)
    city: str = Field(..., min_length=2, max_length=100)
    contact_person: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None

class DealerCreate(DealerBase):
    pass

class DealerUpdate(BaseModel):
    dealer_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class DealerResponse(DealerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    showroom_name: Optional[str] = None
    
    class Config:
        from_attributes = True