from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.factory import Factory
from app.schemas.factory import (
    FactoryCreate, FactoryUpdate, FactoryResponse,
    FactoryWithDepartmentsResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/factories", tags=["Factories"])

# ==================== Factory Endpoints ====================

@router.post("/", response_model=FactoryResponse, status_code=status.HTTP_201_CREATED)
def create_factory(
    factory_data: FactoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new factory (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can create factories")
    
    new_factory = Factory(
        factory_name=factory_data.factory_name,
        location=factory_data.location
    )
    
    db.add(new_factory)
    db.commit()
    db.refresh(new_factory)
    
    return new_factory

@router.get("/", response_model=List[FactoryResponse])
def get_all_factories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all factories (All authenticated users)"""
    factories = db.query(Factory).offset(skip).limit(limit).all()
    return factories

@router.get("/{factory_id}", response_model=FactoryWithDepartmentsResponse)
def get_factory(
    factory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get factory by ID with departments"""
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")
    return factory

@router.put("/{factory_id}", response_model=FactoryResponse)
def update_factory(
    factory_id: int,
    factory_data: FactoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update factory (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can update factories")
    
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")
    
    if factory_data.factory_name:
        factory.factory_name = factory_data.factory_name
    if factory_data.location:
        factory.location = factory_data.location
    
    db.commit()
    db.refresh(factory)
    return factory

@router.delete("/{factory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_factory(
    factory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete factory (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete factories")
    
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")
    
    db.delete(factory)
    db.commit()
    return None