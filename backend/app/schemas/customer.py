from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional

class CustomerBase(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    aadhaar_number: Optional[str] = Field(None, min_length=12, max_length=12)

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    customer_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    city: Optional[str] = None
    state: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True