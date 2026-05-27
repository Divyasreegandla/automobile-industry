from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional

class DeliveryTrackingBase(BaseModel):
    sales_id: int
    vehicle_dispatch_date: Optional[date] = None
    expected_delivery: date
    actual_delivery: Optional[date] = None
    delivery_status: str = "pending"
    tracking_number: Optional[str] = None
    carrier_name: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    current_location: Optional[str] = None
    remarks: Optional[str] = None

class DeliveryTrackingCreate(DeliveryTrackingBase):
    pass

class DeliveryTrackingUpdate(BaseModel):
    vehicle_dispatch_date: Optional[date] = None
    actual_delivery: Optional[date] = None
    delivery_status: Optional[str] = None
    current_location: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    remarks: Optional[str] = None

class DeliveryTrackingResponse(DeliveryTrackingBase):
    id: int
    last_updated: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    customer_name: Optional[str] = None
    vehicle_model: Optional[str] = None
    dealer_name: Optional[str] = None
    
    class Config:
        from_attributes = True