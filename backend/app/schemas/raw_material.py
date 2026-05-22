from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class RawMaterialBase(BaseModel):
    material_code: str = Field(..., min_length=2, max_length=50)
    material_name: str = Field(..., min_length=2, max_length=255)
    category: Optional[str] = None
    stock_quantity: float = Field(0, ge=0)
    unit: str = Field("kg", min_length=1, max_length=20)
    unit_price: float = Field(0, ge=0)
    minimum_stock: float = Field(0, ge=0)
    maximum_stock: float = Field(0, ge=0)
    supplier_id: int
    location: Optional[str] = None
    description: Optional[str] = None

class RawMaterialCreate(RawMaterialBase):
    pass

class RawMaterialUpdate(BaseModel):
    material_name: Optional[str] = Field(None, min_length=2, max_length=255)
    stock_quantity: Optional[float] = Field(None, ge=0)
    unit_price: Optional[float] = Field(None, ge=0)
    minimum_stock: Optional[float] = Field(None, ge=0)
    maximum_stock: Optional[float] = Field(None, ge=0)
    supplier_id: Optional[int] = None
    location: Optional[str] = None
    description: Optional[str] = None

class RawMaterialResponse(RawMaterialBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class RawMaterialWithSupplierResponse(RawMaterialResponse):
    supplier_name: Optional[str] = None
    supplier_contact: Optional[str] = None