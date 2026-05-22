from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.schemas.department import DepartmentResponse

# Factory Schemas
class FactoryBase(BaseModel):
    factory_name: str = Field(..., min_length=2, max_length=255)
    location: str = Field(..., min_length=2, max_length=255)

class FactoryCreate(FactoryBase):
    pass

class FactoryUpdate(BaseModel):
    factory_name: Optional[str] = Field(None, min_length=2, max_length=255)
    location: Optional[str] = Field(None, min_length=2, max_length=255)

class FactoryResponse(FactoryBase):
    id: int
    total_departments: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class FactoryWithDepartmentsResponse(FactoryResponse):
    departments: List[DepartmentResponse] = []