from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.attendance import Attendance
from app.models.worker import Worker
from app.schemas.attendance import (
    AttendanceCreate, AttendanceUpdate, AttendanceResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/attendance", tags=["Attendance"])

@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def create_attendance(
    attendance_data: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark attendance for a worker"""
    # Allow admin, manager, supervisor, AND employee to create their own attendance
    if current_user.role not in ["admin", "manager", "supervisor", "employee"]:
        raise HTTPException(status_code=403, detail="Not authorized to mark attendance")
    
    # If user is employee, they can only mark their own attendance
    if current_user.role == "employee":
        # Get worker record for this employee
        worker = db.query(Worker).filter(Worker.email == current_user.email).first()
        if not worker or worker.id != attendance_data.worker_id:
            raise HTTPException(status_code=403, detail="You can only mark your own attendance")
    
    worker = db.query(Worker).filter(Worker.id == attendance_data.worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    # Check if attendance already exists for this date
    existing = db.query(Attendance).filter(
        Attendance.worker_id == attendance_data.worker_id,
        Attendance.attendance_date == attendance_data.attendance_date
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already marked for this date")
    
    new_attendance = Attendance(**attendance_data.model_dump())
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    return new_attendance

@router.get("/", response_model=List[AttendanceResponse])
def get_all_attendance(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    worker_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get attendance records with filters"""
    query = db.query(Attendance)
    
    # If employee, only show their own attendance
    if current_user.role == "employee":
        worker = db.query(Worker).filter(Worker.email == current_user.email).first()
        if worker:
            query = query.filter(Attendance.worker_id == worker.id)
    
    if worker_id:
        query = query.filter(Attendance.worker_id == worker_id)
    if start_date:
        query = query.filter(Attendance.attendance_date >= start_date)
    if end_date:
        query = query.filter(Attendance.attendance_date <= end_date)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{attendance_id}", response_model=AttendanceResponse)
def get_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get attendance by ID"""
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    # If employee, check if it's their own record
    if current_user.role == "employee":
        worker = db.query(Worker).filter(Worker.email == current_user.email).first()
        if not worker or attendance.worker_id != worker.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return attendance

@router.get("/worker/{worker_id}")
def get_worker_attendance(
    worker_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get attendance for a specific worker"""
    # If employee, only allow viewing their own
    if current_user.role == "employee":
        worker = db.query(Worker).filter(Worker.email == current_user.email).first()
        if not worker or worker.id != worker_id:
            raise HTTPException(status_code=403, detail="You can only view your own attendance")
    
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    attendance = db.query(Attendance).filter(
        Attendance.worker_id == worker_id
    ).offset(skip).limit(limit).all()
    
    return {
        "worker_id": worker_id,
        "worker_name": worker.full_name,
        "total_records": len(attendance),
        "attendance": attendance
    }

@router.put("/{attendance_id}", response_model=AttendanceResponse)
def update_attendance(
    attendance_id: int,
    attendance_data: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update attendance (check-out, overtime)"""
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    # If employee, check if it's their own record
    if current_user.role == "employee":
        worker = db.query(Worker).filter(Worker.email == current_user.email).first()
        if not worker or attendance.worker_id != worker.id:
            raise HTTPException(status_code=403, detail="You can only update your own attendance")
    
    if current_user.role not in ["admin", "manager", "supervisor", "employee"]:
        raise HTTPException(status_code=403, detail="Not authorized to update attendance")
    
    for key, value in attendance_data.model_dump(exclude_unset=True).items():
        setattr(attendance, key, value)
    
    db.commit()
    db.refresh(attendance)
    return attendance

@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete attendance record (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete attendance records")
    
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    db.delete(attendance)
    db.commit()
    return None