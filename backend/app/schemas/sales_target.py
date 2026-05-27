from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class SalesTargetBase(BaseModel):
    showroom_id: int
    target_month: int = Field(..., ge=1, le=12)
    target_year: int = Field(..., ge=2024, le=2030)
    target_count: int = Field(0, ge=0)
    achieved_count: int = Field(0, ge=0)
    target_revenue: float = Field(0, ge=0)
    achieved_revenue: float = Field(0, ge=0)

class SalesTargetCreate(SalesTargetBase):
    pass

class SalesTargetUpdate(BaseModel):
    target_count: Optional[int] = Field(None, ge=0)
    achieved_count: Optional[int] = Field(None, ge=0)
    target_revenue: Optional[float] = Field(None, ge=0)
    achieved_revenue: Optional[float] = Field(None, ge=0)

class SalesTargetResponse(SalesTargetBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    showroom_name: Optional[str] = None
    achievement_percentage: Optional[float] = None
    revenue_achievement_percentage: Optional[float] = None
    
    class Config:
        from_attributes = True