from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class VehicleModelBase(BaseModel):
    model_name: str = Field(..., min_length=2, max_length=255)
    variant: str = Field(..., min_length=2, max_length=100)
    fuel_type: str
    transmission: str
    ex_showroom_price: float = Field(0, ge=0)

class VehicleModelCreate(VehicleModelBase):
    pass

class VehicleModelUpdate(BaseModel):
    ex_showroom_price: Optional[float] = Field(None, ge=0)

class VehicleModelResponse(VehicleModelBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True