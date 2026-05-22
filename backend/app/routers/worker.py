from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.worker import Worker
from app.models.department import Department
from app.schemas.worker import (
    WorkerCreate, WorkerUpdate, WorkerResponse, WorkerWithDepartmentResponse
)
from app.core.auth import get_current_user
from app.models.user import User
import random
import string

router = APIRouter(prefix="/api/v1/workers", tags=["Workers"])

# Helper function to generate employee code
def generate_employee_code(db: Session) -> str:
    """Generate unique employee code"""
    while True:
        # Format: EMP + Year + 6 digit random number
        year = date.today().year
        random_num = ''.join(random.choices(string.digits, k=6))
        employee_code = f"EMP{year}{random_num}"
        
        # Check if code exists
        existing = db.query(Worker).filter(Worker.employee_code == employee_code).first()
        if not existing:
            return employee_code

@router.post("/", response_model=WorkerResponse, status_code=status.HTTP_201_CREATED)
def create_worker(
    worker_data: WorkerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new worker/employee
    
    - **Requires**: Admin or Manager role
    - **Auto-generates**: Unique employee code
    """
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can create workers"
        )
    
    # Check if department exists
    department = db.query(Department).filter(Department.id == worker_data.department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with id {worker_data.department_id} not found"
        )
    
    # Check if email already exists
    if worker_data.email:
        existing_email = db.query(Worker).filter(Worker.email == worker_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Generate unique employee code
    employee_code = generate_employee_code(db)
    
    # Create new worker
    new_worker = Worker(
        employee_code=employee_code,
        full_name=worker_data.full_name,
        email=worker_data.email,
        phone=worker_data.phone,
        address=worker_data.address,
        designation=worker_data.designation,
        department_id=worker_data.department_id,
        joining_date=worker_data.joining_date,
        basic_salary=worker_data.basic_salary,
        shift_type=worker_data.shift_type,
        status=worker_data.status,
        emergency_contact_name=worker_data.emergency_contact_name,
        emergency_contact_phone=worker_data.emergency_contact_phone
    )
    
    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)
    
    return new_worker

@router.get("/", response_model=List[WorkerResponse])
def get_all_workers(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search by name, email, or employee code"),
    department_id: Optional[int] = Query(None, description="Filter by department"),
    status: Optional[str] = Query(None, description="Filter by status"),
    shift_type: Optional[str] = Query(None, description="Filter by shift type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all workers with pagination, search, and filters
    
    - **skip**: Number of records to skip
    - **limit**: Maximum records to return (1-1000)
    - **search**: Search by name, email, or employee code
    - **department_id**: Filter by department
    - **status**: Filter by employment status
    - **shift_type**: Filter by shift type
    """
    query = db.query(Worker)
    
    # Apply search
    if search:
        query = query.filter(
            or_(
                Worker.full_name.ilike(f"%{search}%"),
                Worker.email.ilike(f"%{search}%"),
                Worker.employee_code.ilike(f"%{search}%"),
                Worker.phone.ilike(f"%{search}%")
            )
        )
    
    # Apply filters
    if department_id:
        query = query.filter(Worker.department_id == department_id)
    if status:
        query = query.filter(Worker.status == status)
    if shift_type:
        query = query.filter(Worker.shift_type == shift_type)
    
    workers = query.offset(skip).limit(limit).all()
    return workers

@router.get("/{worker_id}", response_model=WorkerWithDepartmentResponse)
def get_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get worker by ID with department details
    """
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Worker with id {worker_id} not found"
        )
    
    # Add department and factory names
    response = WorkerWithDepartmentResponse.model_validate(worker)
    if worker.department:
        response.department_name = worker.department.department_name
        if worker.department.factory:
            response.factory_name = worker.department.factory.factory_name
    
    return response

@router.get("/code/{employee_code}", response_model=WorkerResponse)
def get_worker_by_code(
    employee_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get worker by employee code
    """
    worker = db.query(Worker).filter(Worker.employee_code == employee_code).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Worker with employee code {employee_code} not found"
        )
    return worker

@router.put("/{worker_id}", response_model=WorkerResponse)
def update_worker(
    worker_id: int,
    worker_data: WorkerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update worker details
    
    - **Requires**: Admin or Manager role
    """
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can update workers"
        )
    
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Worker with id {worker_id} not found"
        )
    
    # Update fields
    if worker_data.full_name:
        worker.full_name = worker_data.full_name
    if worker_data.email:
        # Check if email is taken by another worker
        existing = db.query(Worker).filter(
            Worker.email == worker_data.email,
            Worker.id != worker_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already used by another worker"
            )
        worker.email = worker_data.email
    if worker_data.phone:
        worker.phone = worker_data.phone
    if worker_data.address:
        worker.address = worker_data.address
    if worker_data.designation:
        worker.designation = worker_data.designation
    if worker_data.department_id:
        # Check if department exists
        department = db.query(Department).filter(Department.id == worker_data.department_id).first()
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Department with id {worker_data.department_id} not found"
            )
        worker.department_id = worker_data.department_id
    if worker_data.basic_salary is not None:
        worker.basic_salary = worker_data.basic_salary
    if worker_data.shift_type:
        worker.shift_type = worker_data.shift_type
    if worker_data.status:
        worker.status = worker_data.status
    if worker_data.emergency_contact_name:
        worker.emergency_contact_name = worker_data.emergency_contact_name
    if worker_data.emergency_contact_phone:
        worker.emergency_contact_phone = worker_data.emergency_contact_phone
    
    db.commit()
    db.refresh(worker)
    return worker

@router.delete("/{worker_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a worker (Admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete workers"
        )
    
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Worker with id {worker_id} not found"
        )
    
    db.delete(worker)
    db.commit()
    return None

@router.get("/department/{department_id}/workers", response_model=List[WorkerResponse])
def get_workers_by_department(
    department_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all workers in a specific department
    """
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with id {department_id} not found"
        )
    
    workers = db.query(Worker).filter(Worker.department_id == department_id).offset(skip).limit(limit).all()
    return workers