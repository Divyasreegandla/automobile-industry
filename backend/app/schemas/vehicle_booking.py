from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional

class VehicleBookingBase(BaseModel):
    customer_id: int
    vehicle_model_id: int
    showroom_id: int
    booking_date: date
    booking_amount: float = Field(0, ge=0)
    booking_status: str = "pending"

class VehicleBookingCreate(VehicleBookingBase):
    pass

class VehicleBookingUpdate(BaseModel):
    booking_status: Optional[str] = None
    booking_amount: Optional[float] = Field(None, ge=0)

class VehicleBookingResponse(VehicleBookingBase):
    id: int
    booking_number: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    customer_name: Optional[str] = None
    vehicle_model_name: Optional[str] = None
    showroom_name: Optional[str] = None
    
    class Config:
        from_attributes = True