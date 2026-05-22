from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case
from datetime import datetime, timedelta, date as date_type
from typing import List, Optional
from app.database import get_db
from app.models.vehicle_production import VehicleProduction
from app.models.quality_check import QualityCheck
from app.models.maintenance_log import MaintenanceLog
from app.models.machinery import Machinery
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/ai", tags=["AI Predictions"])

@router.get("/predict/production")
def predict_production(
    days_ahead: int = Query(7, ge=1, le=30, description="Days to predict"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Predict production output for next N days"""
    
    # Get last 30 days of production data
    end_date = date_type.today()
    start_date = end_date - timedelta(days=30)
    
    daily_production = db.query(
        VehicleProduction.completion_date,
        func.count(VehicleProduction.id).label('count')
    ).filter(
        and_(
            VehicleProduction.completion_date >= start_date,
            VehicleProduction.completion_date <= end_date,
            VehicleProduction.production_stage == "completed"
        )
    ).group_by(VehicleProduction.completion_date).all()
    
    # Create a dictionary of production by date
    production_by_date = {d: c for d, c in daily_production}
    
    # Calculate average daily production
    if len(production_by_date) > 0:
        avg_daily = sum(production_by_date.values()) / len(production_by_date)
    else:
        avg_daily = 10
    
    # Simple trend calculation
    dates = list(range(len(production_by_date)))
    values = list(production_by_date.values())
    
    if len(dates) > 1:
        n = len(dates)
        sum_x = sum(dates)
        sum_y = sum(values)
        sum_xy = sum(x * y for x, y in zip(dates, values))
        sum_x2 = sum(x * x for x in dates)
        
        denominator = (n * sum_x2 - sum_x * sum_x)
        if denominator != 0:
            slope = (n * sum_xy - sum_x * sum_y) / denominator
        else:
            slope = 0
    else:
        slope = 0
    
    # Generate predictions
    predictions = []
    for i in range(1, days_ahead + 1):
        predicted_date = end_date + timedelta(days=i)
        predicted_value = avg_daily + (slope * (len(production_by_date) + i))
        predicted_value = max(0, predicted_value)
        
        predictions.append({
            "date": predicted_date.isoformat(),
            "predicted_production": round(predicted_value, 0),
            "confidence": "medium"
        })
    
    return {
        "model": "Linear Regression",
        "based_on_days": 30,
        "average_daily_production": round(avg_daily, 2),
        "trend": round(slope, 4),
        "predictions": predictions
    }

@router.get("/predict/quality")
def predict_quality(
    days_ahead: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Predict quality pass rate for next N days"""
    
    # Get last 30 days of quality data
    end_date = date_type.today()
    start_date = end_date - timedelta(days=30)
    
    # Use case statement instead of cast
    quality_data = db.query(
        QualityCheck.check_date,
        func.count(QualityCheck.id).label('total'),
        func.sum(case((QualityCheck.quality_status == "passed", 1), else_=0)).label('passed')
    ).filter(
        and_(
            QualityCheck.check_date >= start_date,
            QualityCheck.check_date <= end_date
        )
    ).group_by(QualityCheck.check_date).all()
    
    # Calculate average pass rate
    pass_rates = []
    for check_date, total, passed in quality_data:
        if total > 0:
            pass_rates.append((passed / total) * 100)
    
    if pass_rates:
        avg_pass_rate = sum(pass_rates) / len(pass_rates)
    else:
        avg_pass_rate = 85
    
    # Generate predictions
    predictions = []
    for i in range(1, days_ahead + 1):
        predicted_date = end_date + timedelta(days=i)
        predictions.append({
            "date": predicted_date.isoformat(),
            "predicted_pass_rate": round(avg_pass_rate, 2),
            "confidence": "high"
        })
    
    return {
        "model": "Historical Average",
        "based_on_days": 30,
        "current_average_pass_rate": round(avg_pass_rate, 2),
        "predictions": predictions
    }

@router.get("/predict/maintenance")
def predict_maintenance(
    machine_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Predict when maintenance will be needed"""
    
    query = db.query(Machinery)
    if machine_id:
        query = query.filter(Machinery.id == machine_id)
    
    machines = query.all()
    
    predictions = []
    for machine in machines:
        maintenance_logs = db.query(MaintenanceLog).filter(
            MaintenanceLog.machine_id == machine.id
        ).order_by(MaintenanceLog.maintenance_date.desc()).limit(5).all()
        
        if len(maintenance_logs) >= 2:
            avg_interval = 0
            for i in range(len(maintenance_logs) - 1):
                days_diff = (maintenance_logs[i].maintenance_date - maintenance_logs[i + 1].maintenance_date).days
                avg_interval += days_diff
            avg_interval = avg_interval / (len(maintenance_logs) - 1)
        else:
            avg_interval = machine.maintenance_cycle_days or 30
        
        last_maintenance = machine.last_maintenance_date
        if last_maintenance:
            days_since = (date_type.today() - last_maintenance).days
            days_until = max(0, avg_interval - days_since)
            if days_until <= 5:
                status = "urgent"
            elif days_until <= 10:
                status = "upcoming"
            else:
                status = "normal"
        else:
            days_until = avg_interval
            status = "normal"
        
        predictions.append({
            "machine_id": machine.id,
            "machine_name": machine.machine_name,
            "last_maintenance": last_maintenance.isoformat() if last_maintenance else None,
            "average_interval_days": round(avg_interval, 0),
            "days_until_next_maintenance": round(days_until, 0),
            "status": status,
            "recommendation": "Schedule maintenance soon" if status == "urgent" else "Normal operation"
        })
    
    return {
        "predictions": predictions,
        "summary": {
            "total_machines": len(predictions),
            "urgent_maintenance": len([p for p in predictions if p["status"] == "urgent"]),
            "upcoming_maintenance": len([p for p in predictions if p["status"] == "upcoming"])
        }
    }

@router.get("/dashboard")
def get_ai_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI prediction dashboard summary"""
    
    end_date = date_type.today()
    start_date = end_date - timedelta(days=30)
    
    # Production stats
    daily_production = db.query(
        VehicleProduction.completion_date,
        func.count(VehicleProduction.id).label('count')
    ).filter(
        and_(
            VehicleProduction.completion_date >= start_date,
            VehicleProduction.completion_date <= end_date,
            VehicleProduction.production_stage == "completed"
        )
    ).group_by(VehicleProduction.completion_date).all()
    
    if daily_production:
        values = [c for _, c in daily_production]
        avg_production = sum(values) / len(values)
        next_week_prediction = avg_production * 7
    else:
        avg_production = 10
        next_week_prediction = 70
    
    # Quality stats
    quality_data = db.query(
        QualityCheck.quality_status,
        func.count(QualityCheck.id).label('count')
    ).filter(
        QualityCheck.check_date >= start_date
    ).group_by(QualityCheck.quality_status).all()
    
    total = sum(c for _, c in quality_data)
    passed = sum(c for s, c in quality_data if s == "passed")
    quality_rate = (passed / total * 100) if total > 0 else 85
    
    # Maintenance stats
    machines = db.query(Machinery).all()
    urgent_maintenance = 0
    for machine in machines:
        if machine.last_maintenance_date:
            days_since = (date_type.today() - machine.last_maintenance_date).days
            if days_since >= (machine.maintenance_cycle_days or 30) - 5:
                urgent_maintenance += 1
    
    return {
        "production_forecast": {
            "next_7_days": round(next_week_prediction, 0),
            "next_30_days": round(next_week_prediction * 4, 0),
            "average_daily": round(avg_production, 2)
        },
        "quality_forecast": {
            "expected_pass_rate": round(quality_rate, 2),
            "expected_fail_rate": round(100 - quality_rate, 2)
        },
        "maintenance_forecast": {
            "urgent_maintenance_needed": urgent_maintenance,
            "total_machines": len(machines)
        }
    }