from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.payroll import Payroll
from app.models.worker import Worker
from app.schemas.payroll import (
    PayrollCreate, PayrollUpdate, PayrollResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/payroll", tags=["Payroll"])

@router.post("/", response_model=PayrollResponse, status_code=status.HTTP_201_CREATED)
def create_payroll(
    payroll_data: PayrollCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create payroll record (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can create payroll records")
    
    worker = db.query(Worker).filter(Worker.id == payroll_data.worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    new_payroll = Payroll(**payroll_data.model_dump())
    db.add(new_payroll)
    db.commit()
    db.refresh(new_payroll)
    return new_payroll

@router.get("/", response_model=List[PayrollResponse])
def get_all_payroll(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    worker_id: Optional[int] = None,
    payment_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all payroll records with filters"""
    query = db.query(Payroll)
    
    if worker_id:
        query = query.filter(Payroll.worker_id == worker_id)
    if payment_status:
        query = query.filter(Payroll.payment_status == payment_status)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{payroll_id}", response_model=PayrollResponse)
def get_payroll(
    payroll_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get payroll by ID"""
    payroll = db.query(Payroll).filter(Payroll.id == payroll_id).first()
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll record not found")
    return payroll

@router.get("/worker/{worker_id}")
def get_worker_payroll(
    worker_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all payroll records for a specific worker"""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    payroll_records = db.query(Payroll).filter(
        Payroll.worker_id == worker_id
    ).offset(skip).limit(limit).all()
    
    return {
        "worker_id": worker_id,
        "worker_name": worker.full_name,
        "total_records": len(payroll_records),
        "payroll": payroll_records
    }

@router.put("/{payroll_id}", response_model=PayrollResponse)
def update_payroll(
    payroll_id: int,
    payroll_data: PayrollUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update payroll record (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can update payroll records")
    
    payroll = db.query(Payroll).filter(Payroll.id == payroll_id).first()
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll record not found")
    
    for key, value in payroll_data.model_dump(exclude_unset=True).items():
        setattr(payroll, key, value)
    
    db.commit()
    db.refresh(payroll)
    return payroll

@router.delete("/{payroll_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payroll(
    payroll_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete payroll record (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete payroll records")
    
    payroll = db.query(Payroll).filter(Payroll.id == payroll_id).first()
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll record not found")
    
    db.delete(payroll)
    db.commit()
    return None