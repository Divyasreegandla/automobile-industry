from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional

class VehicleSaleBase(BaseModel):
    booking_id: int
    dealer_id: int
    delivery_date: Optional[date] = None
    
    # Selling price
    final_price: float = Field(0, ge=0)
    tax_amount: float = Field(0, ge=0)
    insurance_amount: float = Field(0, ge=0)
    registration_amount: float = Field(0, ge=0)
    discount_amount: float = Field(0, ge=0)
    
    # Cost components
    manufacturing_cost: float = Field(0, ge=0)
    transportation_cost: float = Field(0, ge=0)
    dealer_commission: float = Field(0, ge=0)
    marketing_cost: float = Field(0, ge=0)
    overhead_cost: float = Field(0, ge=0)
    
    sale_status: str = "booked"

class VehicleSaleCreate(VehicleSaleBase):
    pass

class VehicleSaleUpdate(BaseModel):
    delivery_date: Optional[date] = None
    sale_status: Optional[str] = None
    final_price: Optional[float] = Field(None, ge=0)
    discount_amount: Optional[float] = Field(None, ge=0)
    manufacturing_cost: Optional[float] = Field(None, ge=0)
    transportation_cost: Optional[float] = Field(None, ge=0)
    dealer_commission: Optional[float] = Field(None, ge=0)
    marketing_cost: Optional[float] = Field(None, ge=0)
    overhead_cost: Optional[float] = Field(None, ge=0)

class VehicleSaleResponse(VehicleSaleBase):
    id: int
    sales_invoice_number: str
    total_amount: float
    total_cost: float
    gross_profit: float
    net_profit: float
    profit_margin: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    customer_name: Optional[str] = None
    vehicle_model_name: Optional[str] = None
    dealer_name: Optional[str] = None
    showroom_name: Optional[str] = None
    
    class Config:
        from_attributes = True