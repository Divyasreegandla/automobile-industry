from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.database import get_db
from app.models.production_line import ProductionLine
from app.models.vehicle_production import VehicleProduction, ProductionStage
from app.models.quality_check import QualityCheck
from app.schemas.production_stats import ProductionStats
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/production/dashboard", tags=["Production Dashboard"])

@router.get("/stats", response_model=ProductionStats)
def get_production_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get production dashboard statistics"""
    
    total_lines = db.query(ProductionLine).count()
    active_lines = db.query(ProductionLine).filter(ProductionLine.is_active == 1).count()
    
    total_vehicles = db.query(VehicleProduction).filter(
        VehicleProduction.production_stage.in_([ProductionStage.IN_PROGRESS, ProductionStage.QUALITY_CHECK])
    ).count()
    
    completed_today = db.query(VehicleProduction).filter(
        VehicleProduction.completion_date == date.today()
    ).count()
    
    total_checks = db.query(QualityCheck).count()
    passed_checks = db.query(QualityCheck).filter(QualityCheck.quality_status == "passed").count()
    pass_rate = (passed_checks / total_checks * 100) if total_checks > 0 else 0
    
    total_cost = db.query(func.sum(VehicleProduction.production_cost)).scalar() or 0
    
    return ProductionStats(
        total_production_lines=total_lines,
        active_production_lines=active_lines,
        total_vehicles_in_production=total_vehicles,
        completed_vehicles_today=completed_today,
        quality_pass_rate=round(pass_rate, 2),
        total_production_cost=float(total_cost)
    )