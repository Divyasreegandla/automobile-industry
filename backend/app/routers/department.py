from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.department import Department
from app.models.factory import Factory
from app.schemas.department import (
    DepartmentCreate, DepartmentUpdate, DepartmentResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/departments", tags=["Departments"])

# ==================== Department Endpoints ====================

@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    department_data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new department in a factory (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can create departments")
    
    # Check if factory exists
    factory = db.query(Factory).filter(Factory.id == department_data.factory_id).first()
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")
    
    new_department = Department(
        department_name=department_data.department_name,
        factory_id=department_data.factory_id
    )
    
    db.add(new_department)
    # Update factory total_departments
    factory.total_departments += 1
    db.commit()
    db.refresh(new_department)
    
    return new_department

@router.get("/", response_model=List[DepartmentResponse])
def get_all_departments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all departments"""
    departments = db.query(Department).offset(skip).limit(limit).all()
    return departments

@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get department by ID"""
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department

@router.get("/factory/{factory_id}", response_model=List[DepartmentResponse])
def get_factory_departments(
    factory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all departments in a specific factory"""
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")
    
    return factory.departments

@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    department_data: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update department (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can update departments")
    
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    if department_data.department_name:
        department.department_name = department_data.department_name
    
    db.commit()
    db.refresh(department)
    return department

@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete department (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete departments")
    
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Update factory total_departments
    factory = db.query(Factory).filter(Factory.id == department.factory_id).first()
    if factory:
        factory.total_departments -= 1
    
    db.delete(department)
    db.commit()
    return None