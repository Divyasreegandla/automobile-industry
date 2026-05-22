from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.maintenance_log import MaintenanceLog
from app.models.machinery import Machinery
from app.models.robotics import Robotics
from app.schemas.maintenance_log import (
    MaintenanceLogCreate, MaintenanceLogUpdate, MaintenanceLogResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/maintenance", tags=["Maintenance"])

@router.post("/logs", response_model=MaintenanceLogResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance_log(
    log_data: MaintenanceLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can create maintenance logs")
    
    if not log_data.machine_id and not log_data.robot_id:
        raise HTTPException(status_code=400, detail="Either machine_id or robot_id must be provided")
    
    if log_data.machine_id:
        machine = db.query(Machinery).filter(Machinery.id == log_data.machine_id).first()
        if not machine:
            raise HTTPException(status_code=404, detail="Machine not found")
        machine.last_maintenance_date = log_data.maintenance_date
        if log_data.next_maintenance_due:
            machine.next_maintenance_date = log_data.next_maintenance_due
    
    if log_data.robot_id:
        robot = db.query(Robotics).filter(Robotics.id == log_data.robot_id).first()
        if not robot:
            raise HTTPException(status_code=404, detail="Robot not found")
        robot.last_maintenance_date = log_data.maintenance_date
        if log_data.next_maintenance_due:
            robot.next_maintenance_date = log_data.next_maintenance_due
    
    new_log = MaintenanceLog(**log_data.model_dump())
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.get("/logs", response_model=List[MaintenanceLogResponse])
def get_maintenance_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    machine_id: Optional[int] = None,
    robot_id: Optional[int] = None,
    maintenance_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(MaintenanceLog)
    if machine_id:
        query = query.filter(MaintenanceLog.machine_id == machine_id)
    if robot_id:
        query = query.filter(MaintenanceLog.robot_id == robot_id)
    if maintenance_type:
        query = query.filter(MaintenanceLog.maintenance_type == maintenance_type)
    return query.offset(skip).limit(limit).all()

@router.get("/logs/{log_id}", response_model=MaintenanceLogResponse)
def get_maintenance_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    return log

@router.get("/machine/{machine_id}/cost-report", response_model=dict)
def get_machine_maintenance_cost(
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(MaintenanceLog).filter(MaintenanceLog.machine_id == machine_id).all()
    total_cost = sum(log.maintenance_cost for log in logs)
    total_downtime = sum(log.downtime_hours for log in logs)
    return {
        "machine_id": machine_id,
        "total_maintenance_cost": total_cost,
        "total_downtime_hours": total_downtime,
        "maintenance_count": len(logs),
        "average_cost_per_maintenance": total_cost / len(logs) if logs else 0
    }