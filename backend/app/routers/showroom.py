from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.showroom import Showroom
from app.schemas.showroom import ShowroomCreate, ShowroomUpdate, ShowroomResponse
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/showrooms", tags=["Showrooms"])

@router.post("/", response_model=ShowroomResponse, status_code=status.HTTP_201_CREATED)
def create_showroom(
    data: ShowroomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    existing = db.query(Showroom).filter(Showroom.showroom_code == data.showroom_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Showroom code already exists")
    
    new_showroom = Showroom(**data.model_dump())
    db.add(new_showroom)
    db.commit()
    db.refresh(new_showroom)
    return new_showroom

@router.get("/", response_model=List[ShowroomResponse])
def get_showrooms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    state: Optional[str] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Showroom)
    if state:
        query = query.filter(Showroom.state == state)
    if city:
        query = query.filter(Showroom.city == city)
    return query.offset(skip).limit(limit).all()

@router.get("/{showroom_id}", response_model=ShowroomResponse)
def get_showroom(
    showroom_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    showroom = db.query(Showroom).filter(Showroom.id == showroom_id).first()
    if not showroom:
        raise HTTPException(status_code=404, detail="Showroom not found")
    return showroom

@router.put("/{showroom_id}", response_model=ShowroomResponse)
def update_showroom(
    showroom_id: int,
    data: ShowroomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    showroom = db.query(Showroom).filter(Showroom.id == showroom_id).first()
    if not showroom:
        raise HTTPException(status_code=404, detail="Showroom not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(showroom, key, value)
    
    db.commit()
    db.refresh(showroom)
    return showroom

@router.delete("/{showroom_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_showroom(
    showroom_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    showroom = db.query(Showroom).filter(Showroom.id == showroom_id).first()
    if not showroom:
        raise HTTPException(status_code=404, detail="Showroom not found")
    
    db.delete(showroom)
    db.commit()
    return None