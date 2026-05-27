from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/customers", tags=["Customers"])

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_customer = Customer(**data.model_dump())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

@router.get("/", response_model=List[CustomerResponse])
def get_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    phone: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Customer)
    if phone:
        query = query.filter(Customer.phone == phone)
    return query.offset(skip).limit(limit).all()

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(customer, key, value)
    
    db.commit()
    db.refresh(customer)
    return customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(customer)
    db.commit()
    return None