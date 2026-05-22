from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.schemas.vehicle_production import VehicleTypeEnum, VehicleProductionResponse

# Production Line Schemas
class ProductionLineBase(BaseModel):
    line_name: str = Field(..., min_length=2, max_length=100)
    line_code: str = Field(..., min_length=2, max_length=50)
    department_id: int
    vehicle_type: VehicleTypeEnum
    target_per_day: int = Field(..., ge=0)
    current_output: int = Field(0, ge=0)
    is_active: int = Field(1, ge=0, le=1)

class ProductionLineCreate(ProductionLineBase):
    pass

class ProductionLineUpdate(BaseModel):
    line_name: Optional[str] = Field(None, min_length=2, max_length=100)
    target_per_day: Optional[int] = Field(None, ge=0)
    current_output: Optional[int] = Field(None, ge=0)
    is_active: Optional[int] = Field(None, ge=0, le=1)

class ProductionLineResponse(ProductionLineBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ProductionLineWithVehiclesResponse(ProductionLineResponse):
    vehicles: List[VehicleProductionResponse] = []