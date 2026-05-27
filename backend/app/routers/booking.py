from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.vehicle_booking import VehicleBooking, BookingStatus
from app.models.customer import Customer
from app.models.vehicle_model import VehicleModel
from app.models.showroom import Showroom
from app.schemas.vehicle_booking import VehicleBookingCreate, VehicleBookingUpdate, VehicleBookingResponse
from app.core.auth import get_current_user
from app.models.user import User
import random
import string

router = APIRouter(prefix="/api/v1/bookings", tags=["Bookings"])

def generate_booking_number() -> str:
    """Generate unique booking number"""
    year = date.today().year
    random_num = ''.join(random.choices(string.digits, k=6))
    return f"BK{year}{random_num}"

@router.post("/", response_model=VehicleBookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    data: VehicleBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if customer exists
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check if vehicle model exists
    vehicle = db.query(VehicleModel).filter(VehicleModel.id == data.vehicle_model_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle model not found")
    
    # Check if showroom exists
    showroom = db.query(Showroom).filter(Showroom.id == data.showroom_id).first()
    if not showroom:
        raise HTTPException(status_code=404, detail="Showroom not found")
    
    # Generate booking number
    booking_number = generate_booking_number()
    
    new_booking = VehicleBooking(
        booking_number=booking_number,
        **data.model_dump()
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    # Prepare response with names
    response = VehicleBookingResponse.model_validate(new_booking)
    response.customer_name = customer.customer_name
    response.vehicle_model_name = vehicle.model_name
    response.showroom_name = showroom.showroom_name
    return response

@router.get("/", response_model=List[VehicleBookingResponse])
def get_bookings(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    customer_id: Optional[int] = None,
    showroom_id: Optional[int] = None,
    booking_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(VehicleBooking)
    
    if customer_id:
        query = query.filter(VehicleBooking.customer_id == customer_id)
    if showroom_id:
        query = query.filter(VehicleBooking.showroom_id == showroom_id)
    if booking_status:
        query = query.filter(VehicleBooking.booking_status == booking_status)
    
    bookings = query.offset(skip).limit(limit).all()
    
    result = []
    for b in bookings:
        response = VehicleBookingResponse.model_validate(b)
        if b.customer:
            response.customer_name = b.customer.customer_name
        if b.vehicle_model:
            response.vehicle_model_name = b.vehicle_model.model_name
        if b.showroom:
            response.showroom_name = b.showroom.showroom_name
        result.append(response)
    
    return result

@router.get("/{booking_id}", response_model=VehicleBookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(VehicleBooking).filter(VehicleBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    response = VehicleBookingResponse.model_validate(booking)
    if booking.customer:
        response.customer_name = booking.customer.customer_name
    if booking.vehicle_model:
        response.vehicle_model_name = booking.vehicle_model.model_name
    if booking.showroom:
        response.showroom_name = booking.showroom.showroom_name
    return response

@router.put("/{booking_id}", response_model=VehicleBookingResponse)
def update_booking(
    booking_id: int,
    data: VehicleBookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    booking = db.query(VehicleBooking).filter(VehicleBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(booking, key, value)
    
    db.commit()
    db.refresh(booking)
    
    response = VehicleBookingResponse.model_validate(booking)
    if booking.customer:
        response.customer_name = booking.customer.customer_name
    if booking.vehicle_model:
        response.vehicle_model_name = booking.vehicle_model.model_name
    if booking.showroom:
        response.showroom_name = booking.showroom.showroom_name
    return response

@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    booking = db.query(VehicleBooking).filter(VehicleBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    db.delete(booking)
    db.commit()
    return None