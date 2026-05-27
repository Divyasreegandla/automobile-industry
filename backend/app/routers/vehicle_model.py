from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.vehicle_model import VehicleModel
from app.schemas.vehicle_model import VehicleModelCreate, VehicleModelUpdate, VehicleModelResponse
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/vehicle-models", tags=["Vehicle Models"])

@router.post("/", response_model=VehicleModelResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle_model(
    data: VehicleModelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_model = VehicleModel(**data.model_dump())
    db.add(new_model)
    db.commit()
    db.refresh(new_model)
    return new_model

@router.get("/", response_model=List[VehicleModelResponse])
def get_vehicle_models(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    fuel_type: Optional[str] = None,
    transmission: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(VehicleModel)
    if fuel_type:
        query = query.filter(VehicleModel.fuel_type == fuel_type)
    if transmission:
        query = query.filter(VehicleModel.transmission == transmission)
    return query.offset(skip).limit(limit).all()

@router.get("/{model_id}", response_model=VehicleModelResponse)
def get_vehicle_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    model = db.query(VehicleModel).filter(VehicleModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Vehicle model not found")
    return model

@router.put("/{model_id}", response_model=VehicleModelResponse)
def update_vehicle_model(
    model_id: int,
    data: VehicleModelUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    model = db.query(VehicleModel).filter(VehicleModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Vehicle model not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(model, key, value)
    
    db.commit()
    db.refresh(model)
    return model

@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    model = db.query(VehicleModel).filter(VehicleModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Vehicle model not found")
    
    db.delete(model)
    db.commit()
    return None