from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class RegionalSalesReportBase(BaseModel):
    state: str = Field(..., min_length=2, max_length=100)
    district: Optional[str] = Field(None, min_length=2, max_length=100)
    total_sales: int = Field(0, ge=0)
    total_revenue: float = Field(0, ge=0)
    report_month: int = Field(..., ge=1, le=12)
    report_year: int = Field(..., ge=2024, le=2030)

class RegionalSalesReportCreate(RegionalSalesReportBase):
    pass

class RegionalSalesReportUpdate(BaseModel):
    total_sales: Optional[int] = Field(None, ge=0)
    total_revenue: Optional[float] = Field(None, ge=0)

class RegionalSalesReportResponse(RegionalSalesReportBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True