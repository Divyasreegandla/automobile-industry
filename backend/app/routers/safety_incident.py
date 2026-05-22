from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.safety_incident import SafetyIncident
from app.models.worker import Worker
from app.schemas.safety_incident import (
    SafetyIncidentCreate, SafetyIncidentUpdate, SafetyIncidentResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/safety", tags=["Safety Incidents"])

@router.post("/incidents", response_model=SafetyIncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_data: SafetyIncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a safety incident record (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can create safety incidents")
    
    worker = db.query(Worker).filter(Worker.id == incident_data.worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    new_incident = SafetyIncident(**incident_data.model_dump())
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    return new_incident

@router.get("/incidents", response_model=List[SafetyIncidentResponse])
def get_all_incidents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    worker_id: Optional[int] = None,
    severity: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all safety incidents with filters"""
    query = db.query(SafetyIncident)
    
    if worker_id:
        query = query.filter(SafetyIncident.worker_id == worker_id)
    if severity:
        query = query.filter(SafetyIncident.severity == severity)
    if start_date:
        query = query.filter(SafetyIncident.incident_date >= start_date)
    if end_date:
        query = query.filter(SafetyIncident.incident_date <= end_date)
    
    return query.offset(skip).limit(limit).all()

@router.get("/incidents/{incident_id}", response_model=SafetyIncidentResponse)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get safety incident by ID"""
    incident = db.query(SafetyIncident).filter(SafetyIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Safety incident not found")
    return incident

@router.get("/worker/{worker_id}")
def get_worker_incidents(
    worker_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all safety incidents for a specific worker"""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    incidents = db.query(SafetyIncident).filter(
        SafetyIncident.worker_id == worker_id
    ).offset(skip).limit(limit).all()
    
    return {
        "worker_id": worker_id,
        "worker_name": worker.full_name,
        "total_incidents": len(incidents),
        "incidents": incidents
    }

@router.put("/incidents/{incident_id}", response_model=SafetyIncidentResponse)
def update_incident(
    incident_id: int,
    incident_data: SafetyIncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update safety incident (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can update safety incidents")
    
    incident = db.query(SafetyIncident).filter(SafetyIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Safety incident not found")
    
    for key, value in incident_data.model_dump(exclude_unset=True).items():
        setattr(incident, key, value)
    
    db.commit()
    db.refresh(incident)
    return incident

@router.delete("/incidents/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete safety incident (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete safety incidents")
    
    incident = db.query(SafetyIncident).filter(SafetyIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Safety incident not found")
    
    db.delete(incident)
    db.commit()
    return None

@router.get("/dashboard/summary")
def get_safety_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get safety dashboard summary"""
    
    total_incidents = db.query(SafetyIncident).count()
    
    # By severity
    severity_counts = db.query(
        SafetyIncident.severity,
        func.count(SafetyIncident.id).label('count')
    ).group_by(SafetyIncident.severity).all()
    
    # Current month incidents
    today = date.today()
    month_start = date(today.year, today.month, 1)
    monthly_incidents = db.query(SafetyIncident).filter(
        SafetyIncident.incident_date >= month_start
    ).count()
    
    return {
        "total_incidents": total_incidents,
        "monthly_incidents": monthly_incidents,
        "severity_breakdown": {severity: count for severity, count in severity_counts}
    }