from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from app.database import get_db
from app.models.machinery import Machinery
from app.models.department import Department
from app.schemas.machinery import (
    MachineryCreate, MachineryUpdate, MachineryResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/machinery", tags=["Machinery"])

def calculate_next_maintenance(last_date, cycle_days):
    if last_date:
        return last_date + timedelta(days=cycle_days)
    return None

@router.post("/", response_model=MachineryResponse, status_code=status.HTTP_201_CREATED)
def create_machinery(
    machinery_data: MachineryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can create machinery")
    
    department = db.query(Department).filter(Department.id == machinery_data.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    existing = db.query(Machinery).filter(Machinery.machine_code == machinery_data.machine_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Machine code already exists")
    
    new_machine = Machinery(**machinery_data.model_dump())
    db.add(new_machine)
    db.commit()
    db.refresh(new_machine)
    return new_machine

@router.get("/", response_model=List[MachineryResponse])
def get_machinery(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    department_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Machinery)
    if department_id:
        query = query.filter(Machinery.department_id == department_id)
    if status:
        query = query.filter(Machinery.current_status == status)
    return query.offset(skip).limit(limit).all()

@router.get("/{machine_id}", response_model=MachineryResponse)
def get_machinery_by_id(
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    machine = db.query(Machinery).filter(Machinery.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machinery not found")
    return machine

@router.put("/{machine_id}", response_model=MachineryResponse)
def update_machinery(
    machine_id: int,
    machinery_data: MachineryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can update machinery")
    
    machine = db.query(Machinery).filter(Machinery.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machinery not found")
    
    for key, value in machinery_data.model_dump(exclude_unset=True).items():
        setattr(machine, key, value)
    
    db.commit()
    db.refresh(machine)
    return machine

@router.delete("/{machine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_machinery(
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete machinery")
    
    machine = db.query(Machinery).filter(Machinery.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machinery not found")
    
    db.delete(machine)
    db.commit()
    return None