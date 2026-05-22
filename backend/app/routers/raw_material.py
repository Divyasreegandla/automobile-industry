from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.raw_material import RawMaterial
from app.models.supplier import Supplier
from app.schemas.raw_material import (
    RawMaterialCreate, RawMaterialUpdate, RawMaterialResponse,
    RawMaterialWithSupplierResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/raw-materials", tags=["Raw Materials"])

@router.post("/", response_model=RawMaterialResponse, status_code=status.HTTP_201_CREATED)
def create_raw_material(
    material_data: RawMaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new raw material (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can create raw materials")
    
    # Check if supplier exists
    supplier = db.query(Supplier).filter(Supplier.id == material_data.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Check if material code exists
    existing = db.query(RawMaterial).filter(RawMaterial.material_code == material_data.material_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Material code already exists")
    
    new_material = RawMaterial(**material_data.model_dump())
    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return new_material

@router.get("/", response_model=List[RawMaterialResponse])
def get_raw_materials(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = None,
    low_stock: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all raw materials with filters"""
    query = db.query(RawMaterial)
    
    if category:
        query = query.filter(RawMaterial.category == category)
    if low_stock:
        query = query.filter(RawMaterial.stock_quantity <= RawMaterial.minimum_stock)
    
    return query.offset(skip).limit(limit).all()

@router.get("/low-stock", response_model=List[RawMaterialResponse])
def get_low_stock_materials(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all raw materials with low stock"""
    materials = db.query(RawMaterial).filter(
        RawMaterial.stock_quantity <= RawMaterial.minimum_stock
    ).all()
    return materials

@router.get("/{material_id}", response_model=RawMaterialWithSupplierResponse)
def get_raw_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get raw material by ID with supplier details"""
    material = db.query(RawMaterial).filter(RawMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Raw material not found")
    
    response = RawMaterialWithSupplierResponse.model_validate(material)
    if material.supplier:
        response.supplier_name = material.supplier.supplier_name
        response.supplier_contact = material.supplier.phone
    
    return response

@router.put("/{material_id}", response_model=RawMaterialResponse)
def update_raw_material(
    material_id: int,
    material_data: RawMaterialUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update raw material (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can update raw materials")
    
    material = db.query(RawMaterial).filter(RawMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Raw material not found")
    
    if material_data.supplier_id:
        supplier = db.query(Supplier).filter(Supplier.id == material_data.supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
    
    for key, value in material_data.model_dump(exclude_unset=True).items():
        setattr(material, key, value)
    
    db.commit()
    db.refresh(material)
    return material

@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_raw_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete raw material (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete raw materials")
    
    material = db.query(RawMaterial).filter(RawMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Raw material not found")
    
    db.delete(material)
    db.commit()
    return None

@router.patch("/{material_id}/stock", response_model=RawMaterialResponse)
def update_stock(
    material_id: int,
    quantity: float = Query(..., description="Quantity to add (positive) or remove (negative)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update stock quantity (add or remove)"""
    material = db.query(RawMaterial).filter(RawMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Raw material not found")
    
    new_quantity = material.stock_quantity + quantity
    if new_quantity < 0:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    material.stock_quantity = new_quantity
    db.commit()
    db.refresh(material)
    return material