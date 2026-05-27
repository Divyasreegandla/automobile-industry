from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import date, timedelta
from app.database import get_db
from app.models.delivery_tracking import DeliveryTracking, DeliveryStatus
from app.models.vehicle_sale import VehicleSale
from app.models.vehicle_booking import VehicleBooking
from app.schemas.delivery_tracking import DeliveryTrackingCreate, DeliveryTrackingUpdate, DeliveryTrackingResponse
from app.core.auth import get_current_user
from app.models.user import User
import random
import string

router = APIRouter(prefix="/api/v1/delivery", tags=["Delivery Tracking"])

def generate_tracking_number() -> str:
    """Generate unique tracking number"""
    year = date.today().year
    random_num = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"TRK{year}{random_num}"

# ==================== SPECIAL ROUTES FIRST ====================

@router.get("/delayed")
def get_delayed_deliveries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all delayed deliveries"""
    today = date.today()
    delayed = db.query(DeliveryTracking).filter(
        DeliveryTracking.expected_delivery < today,
        DeliveryTracking.delivery_status != "delivered"
    ).all()
    
    result = []
    for d in delayed:
        response = DeliveryTrackingResponse.model_validate(d)
        if d.sale:
            if d.sale.booking:
                if d.sale.booking.customer:
                    response.customer_name = d.sale.booking.customer.customer_name
                if d.sale.booking.vehicle_model:
                    response.vehicle_model = d.sale.booking.vehicle_model.model_name
            if d.sale.dealer:
                response.dealer_name = d.sale.dealer.dealer_name
        result.append(response)
    
    return {
        "total_delayed": len(result),
        "delayed_deliveries": result
    }

@router.get("/today")
def get_today_deliveries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get deliveries expected today"""
    today = date.today()
    deliveries = db.query(DeliveryTracking).filter(
        DeliveryTracking.expected_delivery == today
    ).all()
    
    result = []
    for d in deliveries:
        response = DeliveryTrackingResponse.model_validate(d)
        if d.sale:
            if d.sale.booking:
                if d.sale.booking.customer:
                    response.customer_name = d.sale.booking.customer.customer_name
                if d.sale.booking.vehicle_model:
                    response.vehicle_model = d.sale.booking.vehicle_model.model_name
            if d.sale.dealer:
                response.dealer_name = d.sale.dealer.dealer_name
        result.append(response)
    
    return {
        "total_today": len(result),
        "deliveries": result
    }

@router.get("/status/{status}")
def get_deliveries_by_status(
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get deliveries by status"""
    valid_statuses = [s.value for s in DeliveryStatus]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
    
    deliveries = db.query(DeliveryTracking).filter(
        DeliveryTracking.delivery_status == status
    ).all()
    
    result = []
    for d in deliveries:
        response = DeliveryTrackingResponse.model_validate(d)
        if d.sale:
            if d.sale.booking:
                if d.sale.booking.customer:
                    response.customer_name = d.sale.booking.customer.customer_name
                if d.sale.booking.vehicle_model:
                    response.vehicle_model = d.sale.booking.vehicle_model.model_name
            if d.sale.dealer:
                response.dealer_name = d.sale.dealer.dealer_name
        result.append(response)
    
    return result

# ==================== CRUD ROUTES ====================

@router.post("/", response_model=DeliveryTrackingResponse, status_code=status.HTTP_201_CREATED)
def create_delivery(
    data: DeliveryTrackingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if sale exists
    sale = db.query(VehicleSale).filter(VehicleSale.id == data.sales_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Check if delivery already exists for this sale
    existing = db.query(DeliveryTracking).filter(DeliveryTracking.sales_id == data.sales_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Delivery already created for this sale")
    
    # Generate tracking number
    tracking_number = generate_tracking_number()
    
    # Create new delivery (DO NOT include tracking_number in the data)
    new_delivery = DeliveryTracking(
        sales_id=data.sales_id,
        vehicle_dispatch_date=data.vehicle_dispatch_date,
        expected_delivery=data.expected_delivery,
        actual_delivery=data.actual_delivery,
        delivery_status=data.delivery_status,
        tracking_number=tracking_number,
        carrier_name=data.carrier_name,
        driver_name=data.driver_name,
        driver_phone=data.driver_phone,
        current_location=data.current_location,
        remarks=data.remarks
    )
    db.add(new_delivery)
    db.commit()
    db.refresh(new_delivery)
    
    # Prepare response
    response = DeliveryTrackingResponse.model_validate(new_delivery)
    if sale.booking:
        if sale.booking.customer:
            response.customer_name = sale.booking.customer.customer_name
        if sale.booking.vehicle_model:
            response.vehicle_model = sale.booking.vehicle_model.model_name
    if sale.dealer:
        response.dealer_name = sale.dealer.dealer_name
    
    return response

@router.get("/", response_model=List[DeliveryTrackingResponse])
def get_all_deliveries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    dealer_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DeliveryTracking)
    
    if dealer_id:
        query = query.join(VehicleSale).filter(VehicleSale.dealer_id == dealer_id)
    
    deliveries = query.offset(skip).limit(limit).all()
    
    result = []
    for d in deliveries:
        response = DeliveryTrackingResponse.model_validate(d)
        if d.sale:
            if d.sale.booking:
                if d.sale.booking.customer:
                    response.customer_name = d.sale.booking.customer.customer_name
                if d.sale.booking.vehicle_model:
                    response.vehicle_model = d.sale.booking.vehicle_model.model_name
            if d.sale.dealer:
                response.dealer_name = d.sale.dealer.dealer_name
        result.append(response)
    
    return result

@router.get("/{delivery_id}", response_model=DeliveryTrackingResponse)
def get_delivery(
    delivery_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delivery = db.query(DeliveryTracking).filter(DeliveryTracking.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    
    response = DeliveryTrackingResponse.model_validate(delivery)
    if delivery.sale:
        if delivery.sale.booking:
            if delivery.sale.booking.customer:
                response.customer_name = delivery.sale.booking.customer.customer_name
            if delivery.sale.booking.vehicle_model:
                response.vehicle_model = delivery.sale.booking.vehicle_model.model_name
        if delivery.sale.dealer:
            response.dealer_name = delivery.sale.dealer.dealer_name
    
    return response

@router.get("/track/{tracking_number}", response_model=DeliveryTrackingResponse)
def track_by_number(
    tracking_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delivery = db.query(DeliveryTracking).filter(DeliveryTracking.tracking_number == tracking_number).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Tracking number not found")
    
    response = DeliveryTrackingResponse.model_validate(delivery)
    if delivery.sale:
        if delivery.sale.booking:
            if delivery.sale.booking.customer:
                response.customer_name = delivery.sale.booking.customer.customer_name
            if delivery.sale.booking.vehicle_model:
                response.vehicle_model = delivery.sale.booking.vehicle_model.model_name
        if delivery.sale.dealer:
            response.dealer_name = delivery.sale.dealer.dealer_name
    
    return response

@router.put("/{delivery_id}", response_model=DeliveryTrackingResponse)
def update_delivery(
    delivery_id: int,
    data: DeliveryTrackingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    delivery = db.query(DeliveryTracking).filter(DeliveryTracking.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(delivery, key, value)
    
    # If delivered, update actual delivery date
    if delivery.delivery_status == "delivered" and not delivery.actual_delivery:
        delivery.actual_delivery = date.today()
    
    db.commit()
    db.refresh(delivery)
    
    response = DeliveryTrackingResponse.model_validate(delivery)
    if delivery.sale:
        if delivery.sale.booking:
            if delivery.sale.booking.customer:
                response.customer_name = delivery.sale.booking.customer.customer_name
            if delivery.sale.booking.vehicle_model:
                response.vehicle_model = delivery.sale.booking.vehicle_model.model_name
        if delivery.sale.dealer:
            response.dealer_name = delivery.sale.dealer.dealer_name
    
    return response

@router.delete("/{delivery_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_delivery(
    delivery_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    delivery = db.query(DeliveryTracking).filter(DeliveryTracking.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    
    db.delete(delivery)
    db.commit()
    return None