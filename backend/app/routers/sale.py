from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.vehicle_sale import VehicleSale, SaleStatus
from app.models.vehicle_booking import VehicleBooking
from app.models.dealer import Dealer
from app.schemas.vehicle_sale import VehicleSaleCreate, VehicleSaleUpdate, VehicleSaleResponse
from app.core.auth import get_current_user
from app.models.user import User
import random
import string
from app.models.vehicle_model import VehicleModel

router = APIRouter(prefix="/api/v1/sales", tags=["Vehicle Sales"])

def generate_invoice_number() -> str:
    """Generate unique invoice number"""
    year = date.today().year
    random_num = ''.join(random.choices(string.digits, k=6))
    return f"INV{year}{random_num}"

def calculate_profit_metrics(data):
    """Calculate all profit metrics"""
    # Total revenue
    total_amount = data.final_price + data.tax_amount + data.insurance_amount + data.registration_amount - data.discount_amount
    
    # Total cost
    total_cost = (data.manufacturing_cost + data.transportation_cost + 
                  data.dealer_commission + data.marketing_cost + data.overhead_cost)
    
    # Gross profit (Revenue - Manufacturing cost)
    gross_profit = data.final_price - data.manufacturing_cost
    
    # Net profit (Revenue - All costs)
    net_profit = total_amount - total_cost
    
    # Profit margin
    profit_margin = (net_profit / total_amount * 100) if total_amount > 0 else 0
    
    return {
        "total_amount": total_amount,
        "total_cost": total_cost,
        "gross_profit": gross_profit,
        "net_profit": net_profit,
        "profit_margin": profit_margin
    }

# ==================== SPECIAL ROUTES FIRST ====================

@router.get("/monthly-report")
def get_monthly_sales_report(
    year: int = Query(default=date.today().year),
    month: int = Query(default=date.today().month),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get monthly sales report with profit analysis"""
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)
    
    sales = db.query(VehicleSale).filter(
        VehicleSale.delivery_date >= start_date,
        VehicleSale.delivery_date < end_date,
        VehicleSale.sale_status == "delivered"
    ).all()
    
    total_sales = len(sales)
    total_revenue = sum(s.total_amount for s in sales)
    total_manufacturing_cost = sum(s.manufacturing_cost for s in sales)
    total_transportation_cost = sum(s.transportation_cost for s in sales)
    total_dealer_commission = sum(s.dealer_commission for s in sales)
    total_marketing_cost = sum(s.marketing_cost for s in sales)
    total_overhead_cost = sum(s.overhead_cost for s in sales)
    total_cost = sum(s.total_cost for s in sales)
    total_net_profit = sum(s.net_profit for s in sales)
    
    return {
        "year": year,
        "month": month,
        "summary": {
            "total_sales": total_sales,
            "total_revenue": total_revenue,
            "total_cost": total_cost,
            "total_net_profit": total_net_profit,
            "profit_margin": (total_net_profit / total_revenue * 100) if total_revenue > 0 else 0
        },
        "cost_breakdown": {
            "manufacturing_cost": total_manufacturing_cost,
            "transportation_cost": total_transportation_cost,
            "dealer_commission": total_dealer_commission,
            "marketing_cost": total_marketing_cost,
            "overhead_cost": total_overhead_cost
        }
    }

@router.get("/profit-analysis")
def get_profit_analysis(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed profit analysis for date range"""
    if not start_date:
        start_date = date(date.today().year, date.today().month, 1)
    if not end_date:
        end_date = date.today()
    
    sales = db.query(VehicleSale).filter(
        VehicleSale.delivery_date >= start_date,
        VehicleSale.delivery_date <= end_date,
        VehicleSale.sale_status == "delivered"
    ).all()
    
    if not sales:
        return {
            "period": {"start_date": start_date, "end_date": end_date},
            "message": "No sales found in this period"
        }
    
    total_revenue = sum(s.total_amount for s in sales)
    total_manufacturing = sum(s.manufacturing_cost for s in sales)
    total_transport = sum(s.transportation_cost for s in sales)
    total_commission = sum(s.dealer_commission for s in sales)
    total_marketing = sum(s.marketing_cost for s in sales)
    total_overhead = sum(s.overhead_cost for s in sales)
    total_cost = sum(s.total_cost for s in sales)
    total_profit = sum(s.net_profit for s in sales)
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "total_sales": len(sales),
        "revenue": {
            "total": total_revenue,
            "average_per_vehicle": total_revenue / len(sales)
        },
        "costs": {
            "manufacturing_cost": total_manufacturing,
            "transportation_cost": total_transport,
            "dealer_commission": total_commission,
            "marketing_cost": total_marketing,
            "overhead_cost": total_overhead,
            "total_cost": total_cost
        },
        "profit": {
            "total_net_profit": total_profit,
            "average_profit_per_vehicle": total_profit / len(sales),
            "profit_margin": (total_profit / total_revenue * 100)
        }
    }

@router.get("/profit-by-vehicle")
def get_profit_by_vehicle_model(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get profit breakdown by vehicle model"""
    results = db.query(
        VehicleModel.model_name,
        func.count(VehicleSale.id).label('units_sold'),
        func.avg(VehicleSale.manufacturing_cost).label('avg_manufacturing_cost'),
        func.avg(VehicleSale.final_price).label('avg_selling_price'),
        func.sum(VehicleSale.net_profit).label('total_profit')
    ).join(VehicleBooking, VehicleSale.booking_id == VehicleBooking.id)\
     .join(VehicleModel, VehicleBooking.vehicle_model_id == VehicleModel.id)\
     .filter(VehicleSale.sale_status == "delivered")\
     .group_by(VehicleModel.model_name)\
     .all()
    
    return [
        {
            "model": r.model_name,
            "units_sold": r.units_sold,
            "avg_manufacturing_cost": float(r.avg_manufacturing_cost) if r.avg_manufacturing_cost else 0,
            "avg_selling_price": float(r.avg_selling_price) if r.avg_selling_price else 0,
            "avg_profit_per_unit": float(r.avg_selling_price - r.avg_manufacturing_cost) if r.avg_selling_price else 0,
            "total_profit": float(r.total_profit) if r.total_profit else 0
        }
        for r in results
    ]

@router.get("/profit-by-dealer")
def get_profit_by_dealer(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get profit breakdown by dealer"""
    results = db.query(
        Dealer.dealer_name,
        func.count(VehicleSale.id).label('units_sold'),
        func.sum(VehicleSale.net_profit).label('total_profit'),
        func.avg(VehicleSale.profit_margin).label('avg_margin')
    ).join(VehicleSale, VehicleSale.dealer_id == Dealer.id)\
     .filter(VehicleSale.sale_status == "delivered")\
     .group_by(Dealer.id)\
     .order_by(func.sum(VehicleSale.net_profit).desc())\
     .all()
    
    return [
        {
            "dealer_name": r.dealer_name,
            "units_sold": r.units_sold,
            "total_profit": float(r.total_profit) if r.total_profit else 0,
            "average_margin": float(r.avg_margin) if r.avg_margin else 0
        }
        for r in results
    ]

# ==================== CRUD ROUTES ====================

@router.post("/", response_model=VehicleSaleResponse, status_code=status.HTTP_201_CREATED)
def create_sale(
    data: VehicleSaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if booking exists
    booking = db.query(VehicleBooking).filter(VehicleBooking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if dealer exists
    dealer = db.query(Dealer).filter(Dealer.id == data.dealer_id).first()
    if not dealer:
        raise HTTPException(status_code=404, detail="Dealer not found")
    
    # Check if sale already exists
    existing = db.query(VehicleSale).filter(VehicleSale.booking_id == data.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Sale already created for this booking")
    
    # Calculate profit metrics
    profit_metrics = calculate_profit_metrics(data)
    
    # Generate invoice number
    invoice_number = generate_invoice_number()
    
    new_sale = VehicleSale(
        sales_invoice_number=invoice_number,
        booking_id=data.booking_id,
        dealer_id=data.dealer_id,
        delivery_date=data.delivery_date,
        final_price=data.final_price,
        tax_amount=data.tax_amount,
        insurance_amount=data.insurance_amount,
        registration_amount=data.registration_amount,
        discount_amount=data.discount_amount,
        manufacturing_cost=data.manufacturing_cost,
        transportation_cost=data.transportation_cost,
        dealer_commission=data.dealer_commission,
        marketing_cost=data.marketing_cost,
        overhead_cost=data.overhead_cost,
        total_amount=profit_metrics["total_amount"],
        total_cost=profit_metrics["total_cost"],
        gross_profit=profit_metrics["gross_profit"],
        net_profit=profit_metrics["net_profit"],
        profit_margin=profit_metrics["profit_margin"],
        sale_status=data.sale_status
    )
    db.add(new_sale)
    
    # Update booking status
    booking.booking_status = "completed"
    
    db.commit()
    db.refresh(new_sale)
    
    # Prepare response
    response = VehicleSaleResponse.model_validate(new_sale)
    if booking.customer:
        response.customer_name = booking.customer.customer_name
    if booking.vehicle_model:
        response.vehicle_model_name = booking.vehicle_model.model_name
    if dealer:
        response.dealer_name = dealer.dealer_name
    if booking.showroom:
        response.showroom_name = booking.showroom.showroom_name
    
    return response

@router.get("/", response_model=List[VehicleSaleResponse])
def get_sales(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    dealer_id: Optional[int] = None,
    sale_status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(VehicleSale)
    
    if dealer_id:
        query = query.filter(VehicleSale.dealer_id == dealer_id)
    if sale_status:
        query = query.filter(VehicleSale.sale_status == sale_status)
    if start_date:
        query = query.filter(VehicleSale.delivery_date >= start_date)
    if end_date:
        query = query.filter(VehicleSale.delivery_date <= end_date)
    
    sales = query.offset(skip).limit(limit).all()
    
    result = []
    for sale in sales:
        response = VehicleSaleResponse.model_validate(sale)
        if sale.booking:
            if sale.booking.customer:
                response.customer_name = sale.booking.customer.customer_name
            if sale.booking.vehicle_model:
                response.vehicle_model_name = sale.booking.vehicle_model.model_name
            if sale.booking.showroom:
                response.showroom_name = sale.booking.showroom.showroom_name
        if sale.dealer:
            response.dealer_name = sale.dealer.dealer_name
        result.append(response)
    
    return result

@router.get("/{sale_id}", response_model=VehicleSaleResponse)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sale = db.query(VehicleSale).filter(VehicleSale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    response = VehicleSaleResponse.model_validate(sale)
    if sale.booking:
        if sale.booking.customer:
            response.customer_name = sale.booking.customer.customer_name
        if sale.booking.vehicle_model:
            response.vehicle_model_name = sale.booking.vehicle_model.model_name
        if sale.booking.showroom:
            response.showroom_name = sale.booking.showroom.showroom_name
    if sale.dealer:
        response.dealer_name = sale.dealer.dealer_name
    
    return response

@router.put("/{sale_id}", response_model=VehicleSaleResponse)
def update_sale(
    sale_id: int,
    data: VehicleSaleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    sale = db.query(VehicleSale).filter(VehicleSale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Update fields
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(sale, key, value)
    
    # Recalculate profit metrics if cost or price changed
    cost_fields = ['manufacturing_cost', 'transportation_cost', 'dealer_commission', 'marketing_cost', 'overhead_cost']
    price_fields = ['final_price', 'tax_amount', 'insurance_amount', 'registration_amount', 'discount_amount']
    
    if any(f in data.model_dump(exclude_unset=True) for f in cost_fields + price_fields):
        # Create a temporary object with updated values
        temp_data = type('obj', (object,), {
            'final_price': sale.final_price,
            'tax_amount': sale.tax_amount,
            'insurance_amount': sale.insurance_amount,
            'registration_amount': sale.registration_amount,
            'discount_amount': sale.discount_amount,
            'manufacturing_cost': sale.manufacturing_cost,
            'transportation_cost': sale.transportation_cost,
            'dealer_commission': sale.dealer_commission,
            'marketing_cost': sale.marketing_cost,
            'overhead_cost': sale.overhead_cost
        })
        
        metrics = calculate_profit_metrics(temp_data)
        sale.total_amount = metrics["total_amount"]
        sale.total_cost = metrics["total_cost"]
        sale.gross_profit = metrics["gross_profit"]
        sale.net_profit = metrics["net_profit"]
        sale.profit_margin = metrics["profit_margin"]
    
    db.commit()
    db.refresh(sale)
    
    response = VehicleSaleResponse.model_validate(sale)
    if sale.booking:
        if sale.booking.customer:
            response.customer_name = sale.booking.customer.customer_name
        if sale.booking.vehicle_model:
            response.vehicle_model_name = sale.booking.vehicle_model.model_name
        if sale.booking.showroom:
            response.showroom_name = sale.booking.showroom.showroom_name
    if sale.dealer:
        response.dealer_name = sale.dealer.dealer_name
    
    return response

@router.delete("/{sale_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    sale = db.query(VehicleSale).filter(VehicleSale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    db.delete(sale)
    db.commit()
    return None