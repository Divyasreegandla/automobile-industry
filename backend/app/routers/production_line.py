from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.production_line import ProductionLine
from app.models.department import Department
from app.schemas.production_line import (
    ProductionLineCreate, ProductionLineUpdate, ProductionLineResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/production/lines", tags=["Production Lines"])

@router.post("/", response_model=ProductionLineResponse, status_code=status.HTTP_201_CREATED)
def create_production_line(
    line_data: ProductionLineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new production line (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can create production lines"
        )
    
    department = db.query(Department).filter(Department.id == line_data.department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with id {line_data.department_id} not found"
        )
    
    existing = db.query(ProductionLine).filter(ProductionLine.line_code == line_data.line_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Line code '{line_data.line_code}' already exists"
        )
    
    new_line = ProductionLine(**line_data.model_dump())
    db.add(new_line)
    db.commit()
    db.refresh(new_line)
    return new_line

@router.get("/", response_model=List[ProductionLineResponse])
def get_production_lines(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    department_id: Optional[int] = None,
    is_active: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all production lines with filters"""
    query = db.query(ProductionLine)
    
    if department_id:
        query = query.filter(ProductionLine.department_id == department_id)
    if is_active is not None:
        query = query.filter(ProductionLine.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{line_id}", response_model=ProductionLineResponse)
def get_production_line(
    line_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get production line by ID"""
    line = db.query(ProductionLine).filter(ProductionLine.id == line_id).first()
    if not line:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Production line with id {line_id} not found"
        )
    return line

@router.put("/{line_id}", response_model=ProductionLineResponse)
def update_production_line(
    line_id: int,
    line_data: ProductionLineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update production line (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can update production lines"
        )
    
    line = db.query(ProductionLine).filter(ProductionLine.id == line_id).first()
    if not line:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Production line with id {line_id} not found"
        )
    
    for key, value in line_data.model_dump(exclude_unset=True).items():
        setattr(line, key, value)
    
    db.commit()
    db.refresh(line)
    return line

@router.delete("/{line_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_production_line(
    line_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete production line (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete production lines"
        )
    
    line = db.query(ProductionLine).filter(ProductionLine.id == line_id).first()
    if not line:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Production line with id {line_id} not found"
        )
    
    db.delete(line)
    db.commit()
    return None