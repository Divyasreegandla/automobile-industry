from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database import get_db
from app.models.quality_check import QualityCheck
from app.models.vehicle_production import VehicleProduction, ProductionStage
from app.models.worker import Worker
from app.schemas.quality_check import (
    QualityCheckCreate, QualityCheckResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/production/quality-checks", tags=["Quality Checks"])

@router.post("/", response_model=QualityCheckResponse, status_code=status.HTTP_201_CREATED)
def create_quality_check(
    quality_data: QualityCheckCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a quality check record for a vehicle"""
    vehicle = db.query(VehicleProduction).filter(
        VehicleProduction.id == quality_data.vehicle_production_id
    ).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with id {quality_data.vehicle_production_id} not found"
        )
    
    inspector = db.query(Worker).filter(Worker.id == quality_data.checked_by).first()
    if not inspector:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspector with id {quality_data.checked_by} not found"
        )
    
    new_check = QualityCheck(**quality_data.model_dump())
    db.add(new_check)
    
    if quality_data.quality_status == "passed":
        vehicle.production_stage = ProductionStage.COMPLETED
        vehicle.completion_date = date.today()
    elif quality_data.quality_status == "failed":
        vehicle.production_stage = ProductionStage.REJECTED
    
    db.commit()
    db.refresh(new_check)
    return new_check

@router.get("/vehicle/{vehicle_id}", response_model=List[QualityCheckResponse])
def get_vehicle_quality_checks(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all quality checks for a specific vehicle"""
    return db.query(QualityCheck).filter(
        QualityCheck.vehicle_production_id == vehicle_id
    ).all()

@router.get("/{check_id}", response_model=QualityCheckResponse)
def get_quality_check(
    check_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get quality check by ID"""
    check = db.query(QualityCheck).filter(QualityCheck.id == check_id).first()
    if not check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quality check with id {check_id} not found"
        )
    return check