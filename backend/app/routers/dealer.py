from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.dealer import Dealer
from app.models.showroom import Showroom
from app.schemas.dealer import DealerCreate, DealerUpdate, DealerResponse
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/dealers", tags=["Dealers"])

@router.post("/", response_model=DealerResponse, status_code=status.HTTP_201_CREATED)
def create_dealer(
    data: DealerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    showroom = db.query(Showroom).filter(Showroom.id == data.showroom_id).first()
    if not showroom:
        raise HTTPException(status_code=404, detail="Showroom not found")
    
    existing = db.query(Dealer).filter(Dealer.dealer_code == data.dealer_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Dealer code already exists")
    
    new_dealer = Dealer(**data.model_dump())
    db.add(new_dealer)
    db.commit()
    db.refresh(new_dealer)
    
    response = DealerResponse.model_validate(new_dealer)
    response.showroom_name = showroom.showroom_name
    return response

@router.get("/", response_model=List[DealerResponse])
def get_dealers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    showroom_id: Optional[int] = None,
    state: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Dealer)
    if showroom_id:
        query = query.filter(Dealer.showroom_id == showroom_id)
    if state:
        query = query.filter(Dealer.state == state)
    
    dealers = query.offset(skip).limit(limit).all()
    result = []
    for d in dealers:
        r = DealerResponse.model_validate(d)
        if d.showroom:
            r.showroom_name = d.showroom.showroom_name
        result.append(r)
    return result

@router.get("/{dealer_id}", response_model=DealerResponse)
def get_dealer(
    dealer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dealer = db.query(Dealer).filter(Dealer.id == dealer_id).first()
    if not dealer:
        raise HTTPException(status_code=404, detail="Dealer not found")
    
    response = DealerResponse.model_validate(dealer)
    if dealer.showroom:
        response.showroom_name = dealer.showroom.showroom_name
    return response

@router.put("/{dealer_id}", response_model=DealerResponse)
def update_dealer(
    dealer_id: int,
    data: DealerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    dealer = db.query(Dealer).filter(Dealer.id == dealer_id).first()
    if not dealer:
        raise HTTPException(status_code=404, detail="Dealer not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(dealer, key, value)
    
    db.commit()
    db.refresh(dealer)
    
    response = DealerResponse.model_validate(dealer)
    if dealer.showroom:
        response.showroom_name = dealer.showroom.showroom_name
    return response

@router.delete("/{dealer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dealer(
    dealer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    dealer = db.query(Dealer).filter(Dealer.id == dealer_id).first()
    if not dealer:
        raise HTTPException(status_code=404, detail="Dealer not found")
    
    db.delete(dealer)
    db.commit()
    return None