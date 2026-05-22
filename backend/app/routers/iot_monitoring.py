from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional
from app.database import get_db
from app.models.machinery import Machinery
from app.models.robotics import Robotics
from app.models.production_line import ProductionLine
from app.models.vehicle_production import VehicleProduction
from app.models.quality_check import QualityCheck
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/iot", tags=["IoT Monitoring"])

@router.get("/machine-status")
def get_machine_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get real-time machine status for IoT monitoring"""
    
    machines = db.query(Machinery).all()
    
    status = {
        "total_machines": len(machines),
        "operational": len([m for m in machines if m.current_status == "operational"]),
        "maintenance": len([m for m in machines if m.current_status == "maintenance"]),
        "repair": len([m for m in machines if m.current_status == "repair"]),
        "idle": len([m for m in machines if m.current_status == "idle"]),
        "machines": [
            {
                "id": m.id,
                "name": m.machine_name,
                "code": m.machine_code,
                "status": m.current_status,
                "running_hours": m.running_hours,
                "last_maintenance": m.last_maintenance_date
            }
            for m in machines
        ]
    }
    
    return status

@router.get("/robot-status")
def get_robot_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get real-time robot status for IoT monitoring"""
    
    robots = db.query(Robotics).all()
    
    status = {
        "total_robots": len(robots),
        "operational": len([r for r in robots if r.current_status == "operational"]),
        "charging": len([r for r in robots if r.current_status == "charging"]),
        "maintenance": len([r for r in robots if r.current_status == "maintenance"]),
        "error": len([r for r in robots if r.current_status == "error"]),
        "robots": [
            {
                "id": r.id,
                "name": r.robot_name,
                "code": r.robot_code,
                "status": r.current_status,
                "operating_hours": r.operating_hours,
                "automation_type": r.automation_type
            }
            for r in robots
        ]
    }
    
    return status

@router.get("/production-live")
def get_live_production(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get live production monitoring data"""
    
    today = datetime.now().date()
    
    # Production lines status
    lines = db.query(ProductionLine).all()
    
    # Today's production
    completed_today = db.query(VehicleProduction).filter(
        VehicleProduction.completion_date == today
    ).count()
    
    in_progress = db.query(VehicleProduction).filter(
        VehicleProduction.production_stage == "in_progress"
    ).count()
    
    quality_check = db.query(VehicleProduction).filter(
        VehicleProduction.production_stage == "quality_check"
    ).count()
    
    return {
        "timestamp": datetime.now(),
        "today_production": completed_today,
        "in_progress": in_progress,
        "quality_check_pending": quality_check,
        "production_lines": [
            {
                "id": l.id,
                "name": l.line_name,
                "vehicle_type": l.vehicle_type,
                "target_per_day": l.target_per_day,
                "current_output": l.current_output,
                "status": "active" if l.is_active else "inactive"
            }
            for l in lines
        ]
    }

@router.get("/factory-dashboard")
def get_factory_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get complete factory monitoring dashboard"""
    
    today = datetime.now().date()
    
    # Machine stats
    machines = db.query(Machinery).all()
    robots = db.query(Robotics).all()
    
    # Production stats
    completed_today = db.query(VehicleProduction).filter(
        VehicleProduction.completion_date == today
    ).count()
    
    # Quality stats
    quality_checks_today = db.query(QualityCheck).filter(
        QualityCheck.check_date == today
    ).count()
    
    quality_passed_today = db.query(QualityCheck).filter(
        QualityCheck.check_date == today,
        QualityCheck.quality_status == "passed"
    ).count()
    
    return {
        "timestamp": datetime.now(),
        "machinery": {
            "total": len(machines),
            "operational": len([m for m in machines if m.current_status == "operational"]),
            "maintenance_needed": len([m for m in machines if m.current_status == "maintenance"])
        },
        "robotics": {
            "total": len(robots),
            "operational": len([r for r in robots if r.current_status == "operational"]),
            "error": len([r for r in robots if r.current_status == "error"])
        },
        "production": {
            "completed_today": completed_today,
            "quality_checks_today": quality_checks_today,
            "quality_pass_rate_today": round((quality_passed_today / quality_checks_today * 100), 2) if quality_checks_today > 0 else 0
        }
    }