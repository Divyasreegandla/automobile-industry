from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from enum import Enum

class ProductionStageEnum(str, Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    QUALITY_CHECK = "quality_check"
    COMPLETED = "completed"
    REJECTED = "rejected"

class VehicleTypeEnum(str, Enum):
    SEDAN = "sedan"
    SUV = "suv"
    HATCHBACK = "hatchback"
    ELECTRIC = "electric"

# Vehicle Production Schemas
class VehicleProductionBase(BaseModel):
    vehicle_model: str = Field(..., min_length=2, max_length=100)
    vehicle_type: VehicleTypeEnum
    production_line_id: int
    chassis_number: str = Field(..., min_length=5, max_length=50)
    production_stage: ProductionStageEnum = ProductionStageEnum.PLANNED
    start_date: date
    completion_date: Optional[date] = None
    quantity: int = Field(1, ge=1)
    production_cost: float = Field(0, ge=0)
    notes: Optional[str] = Field(None, max_length=500)

class VehicleProductionCreate(VehicleProductionBase):
    pass

class VehicleProductionUpdate(BaseModel):
    production_stage: Optional[ProductionStageEnum] = None
    completion_date: Optional[date] = None
    quantity: Optional[int] = Field(None, ge=1)
    production_cost: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = Field(None, max_length=500)

class VehicleProductionResponse(VehicleProductionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True