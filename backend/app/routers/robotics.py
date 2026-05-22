from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from app.database import get_db
from app.models.robotics import Robotics
from app.models.department import Department
from app.schemas.robotics import (
    RoboticsCreate, RoboticsUpdate, RoboticsResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/robotics", tags=["Robotics"])

def calculate_next_maintenance(last_date, cycle_days):
    if last_date:
        return last_date + timedelta(days=cycle_days)
    return None

@router.post("/", response_model=RoboticsResponse, status_code=status.HTTP_201_CREATED)
def create_robot(
    robot_data: RoboticsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can create robots")
    
    department = db.query(Department).filter(Department.id == robot_data.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    existing = db.query(Robotics).filter(Robotics.robot_code == robot_data.robot_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Robot code already exists")
    
    new_robot = Robotics(**robot_data.model_dump())
    db.add(new_robot)
    db.commit()
    db.refresh(new_robot)
    return new_robot

@router.get("/", response_model=List[RoboticsResponse])
def get_robots(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    department_id: Optional[int] = None,
    status: Optional[str] = None,
    automation_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Robotics)
    if department_id:
        query = query.filter(Robotics.department_id == department_id)
    if status:
        query = query.filter(Robotics.current_status == status)
    if automation_type:
        query = query.filter(Robotics.automation_type == automation_type)
    return query.offset(skip).limit(limit).all()

@router.get("/{robot_id}", response_model=RoboticsResponse)
def get_robot_by_id(
    robot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    robot = db.query(Robotics).filter(Robotics.id == robot_id).first()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")
    return robot

@router.put("/{robot_id}", response_model=RoboticsResponse)
def update_robot(
    robot_id: int,
    robot_data: RoboticsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can update robots")
    
    robot = db.query(Robotics).filter(Robotics.id == robot_id).first()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")
    
    for key, value in robot_data.model_dump(exclude_unset=True).items():
        setattr(robot, key, value)
    
    db.commit()
    db.refresh(robot)
    return robot

@router.delete("/{robot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_robot(
    robot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete robots")
    
    robot = db.query(Robotics).filter(Robotics.id == robot_id).first()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")
    
    db.delete(robot)
    db.commit()
    return None