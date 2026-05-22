from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional

# Quality Check Schemas
class QualityCheckBase(BaseModel):
    vehicle_production_id: int
    checked_by: int
    check_date: date
    quality_status: str = Field("pending", pattern="^(pending|passed|failed)$")
    defect_type: Optional[str] = Field(None, max_length=200)
    remarks: Optional[str] = Field(None, max_length=500)
    rework_required: int = Field(0, ge=0)

class QualityCheckCreate(QualityCheckBase):
    pass

class QualityCheckUpdate(BaseModel):
    quality_status: Optional[str] = Field(None, pattern="^(pending|passed|failed)$")
    defect_type: Optional[str] = Field(None, max_length=200)
    remarks: Optional[str] = Field(None, max_length=500)
    rework_required: Optional[int] = Field(None, ge=0)

class QualityCheckResponse(QualityCheckBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True