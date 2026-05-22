from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# Department Schemas
class DepartmentBase(BaseModel):
    department_name: str = Field(..., min_length=2, max_length=255)

class DepartmentCreate(DepartmentBase):
    factory_id: int

class DepartmentUpdate(BaseModel):
    department_name: Optional[str] = Field(None, min_length=2, max_length=255)

class DepartmentResponse(DepartmentBase):
    id: int
    factory_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True