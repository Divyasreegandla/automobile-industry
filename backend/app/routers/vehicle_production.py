from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.vehicle_production import VehicleProduction, ProductionStage
from app.models.production_line import ProductionLine
from app.schemas.vehicle_production import (
    VehicleProductionCreate, VehicleProductionUpdate, VehicleProductionResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/production/vehicles", tags=["Vehicle Production"])

@router.post("/", response_model=VehicleProductionResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle_production(
    vehicle_data: VehicleProductionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new vehicle production record"""
    line = db.query(ProductionLine).filter(ProductionLine.id == vehicle_data.production_line_id).first()
    if not line:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Production line with id {vehicle_data.production_line_id} not found"
        )
    
    existing = db.query(VehicleProduction).filter(
        VehicleProduction.chassis_number == vehicle_data.chassis_number
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Chassis number '{vehicle_data.chassis_number}' already exists"
        )
    
    new_vehicle = VehicleProduction(**vehicle_data.model_dump())
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    return new_vehicle

@router.get("/", response_model=List[VehicleProductionResponse])
def get_vehicles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    production_line_id: Optional[int] = None,
    production_stage: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all vehicle productions with filters"""
    query = db.query(VehicleProduction)
    
    if production_line_id:
        query = query.filter(VehicleProduction.production_line_id == production_line_id)
    if production_stage:
        query = query.filter(VehicleProduction.production_stage == production_stage)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{vehicle_id}", response_model=VehicleProductionResponse)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get vehicle production by ID"""
    vehicle = db.query(VehicleProduction).filter(VehicleProduction.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with id {vehicle_id} not found"
        )
    return vehicle

@router.put("/{vehicle_id}", response_model=VehicleProductionResponse)
def update_vehicle(
    vehicle_id: int,
    vehicle_data: VehicleProductionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update vehicle production details"""
    vehicle = db.query(VehicleProduction).filter(VehicleProduction.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with id {vehicle_id} not found"
        )
    
    for key, value in vehicle_data.model_dump(exclude_unset=True).items():
        setattr(vehicle, key, value)
    
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete vehicle production record (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete vehicle records"
        )
    
    vehicle = db.query(VehicleProduction).filter(VehicleProduction.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with id {vehicle_id} not found"
        )
    
    db.delete(vehicle)
    db.commit()
    return None