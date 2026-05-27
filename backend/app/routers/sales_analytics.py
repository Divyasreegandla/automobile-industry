from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import date, datetime, timedelta
from typing import List, Optional
from app.database import get_db
from app.models.vehicle_sale import VehicleSale, SaleStatus
from app.models.vehicle_booking import VehicleBooking
from app.models.vehicle_model import VehicleModel
from app.models.showroom import Showroom
from app.models.dealer import Dealer
from app.models.customer import Customer
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/analytics", tags=["Sales Analytics"])

# ==================== DASHBOARD STATS ====================

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get main dashboard statistics"""
    today = date.today()
    month_start = date(today.year, today.month, 1)
    
    # Today's sales
    today_sales = db.query(VehicleSale).filter(
        VehicleSale.delivery_date == today,
        VehicleSale.sale_status == "delivered"
    ).all()
    
    # Monthly sales
    monthly_sales = db.query(VehicleSale).filter(
        VehicleSale.delivery_date >= month_start,
        VehicleSale.delivery_date <= today,
        VehicleSale.sale_status == "delivered"
    ).all()
    
    # Total sales
    total_sales = db.query(VehicleSale).filter(
        VehicleSale.sale_status == "delivered"
    ).all()
    
    # Pending deliveries
    pending_deliveries = db.query(VehicleSale).filter(
        VehicleSale.sale_status == "booked"
    ).count()
    
    # Top selling model
    top_model = db.query(
        VehicleModel.model_name,
        func.count(VehicleSale.id).label('count')
    ).join(VehicleBooking, VehicleSale.booking_id == VehicleBooking.id)\
     .join(VehicleModel, VehicleBooking.vehicle_model_id == VehicleModel.id)\
     .filter(VehicleSale.sale_status == "delivered")\
     .group_by(VehicleModel.model_name)\
     .order_by(func.count(VehicleSale.id).desc())\
     .first()
    
    # Top performing showroom
    top_showroom = db.query(
        Showroom.showroom_name,
        func.sum(VehicleSale.total_amount).label('revenue')
    ).join(VehicleBooking, VehicleSale.booking_id == VehicleBooking.id)\
     .join(Showroom, VehicleBooking.showroom_id == Showroom.id)\
     .filter(VehicleSale.sale_status == "delivered")\
     .group_by(Showroom.showroom_name)\
     .order_by(func.sum(VehicleSale.total_amount).desc())\
     .first()
    
    return {
        "today": {
            "sales_count": len(today_sales),
            "revenue": sum(s.total_amount for s in today_sales)
        },
        "monthly": {
            "sales_count": len(monthly_sales),
            "revenue": sum(s.total_amount for s in monthly_sales),
            "target": 100,
            "achievement_percentage": (len(monthly_sales) / 100) * 100 if len(monthly_sales) > 0 else 0
        },
        "total": {
            "sales_count": len(total_sales),
            "revenue": sum(s.total_amount for s in total_sales)
        },
        "pending_deliveries": pending_deliveries,
        "top_selling_model": top_model.model_name if top_model else "N/A",
        "top_showroom": top_showroom.showroom_name if top_showroom else "N/A"
    }

# ==================== STATE-WISE SALES ====================

@router.get("/state-wise")
def get_state_wise_sales(
    year: Optional[int] = Query(default=date.today().year),
    month: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get state-wise sales analytics"""
    query = db.query(
        Showroom.state,
        func.count(VehicleSale.id).label('total_sales'),
        func.sum(VehicleSale.total_amount).label('total_revenue')
    ).join(VehicleBooking, VehicleSale.booking_id == VehicleBooking.id)\
     .join(Showroom, VehicleBooking.showroom_id == Showroom.id)\
     .filter(VehicleSale.sale_status == "delivered")
    
    if year:
        query = query.filter(func.extract('year', VehicleSale.delivery_date) == year)
    if month:
        query = query.filter(func.extract('month', VehicleSale.delivery_date) == month)
    
    results = query.group_by(Showroom.state).all()
    
    return [
        {
            "state": r.state,
            "total_sales": r.total_sales,
            "total_revenue": float(r.total_revenue)
        }
        for r in results
    ]

# ==================== CITY-WISE SALES ====================

@router.get("/city-wise")
def get_city_wise_sales(
    state: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get city-wise sales analytics"""
    query = db.query(
        Showroom.city,
        Showroom.state,
        func.count(VehicleSale.id).label('total_sales'),
        func.sum(VehicleSale.total_amount).label('total_revenue')
    ).join(VehicleBooking, VehicleSale.booking_id == VehicleBooking.id)\
     .join(Showroom, VehicleBooking.showroom_id == Showroom.id)\
     .filter(VehicleSale.sale_status == "delivered")
    
    if state:
        query = query.filter(Showroom.state == state)
    
    results = query.group_by(Showroom.city, Showroom.state).all()
    
    return [
        {
            "city": r.city,
            "state": r.state,
            "total_sales": r.total_sales,
            "total_revenue": float(r.total_revenue)
        }
        for r in results
    ]

# ==================== TOP PERFORMERS ====================

@router.get("/top-showrooms")
def get_top_showrooms(
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get top performing showrooms"""
    results = db.query(
        Showroom.showroom_name,
        Showroom.city,
        Showroom.state,
        func.count(VehicleSale.id).label('total_sales'),
        func.sum(VehicleSale.total_amount).label('total_revenue')
    ).join(VehicleBooking, VehicleSale.booking_id == VehicleBooking.id)\
     .join(Showroom, VehicleBooking.showroom_id == Showroom.id)\
     .filter(VehicleSale.sale_status == "delivered")\
     .group_by(Showroom.id)\
     .order_by(func.sum(VehicleSale.total_amount).desc())\
     .limit(limit)\
     .all()
    
    return [
        {
            "showroom_name": r.showroom_name,
            "city": r.city,
            "state": r.state,
            "total_sales": r.total_sales,
            "total_revenue": float(r.total_revenue)
        }
        for r in results
    ]

@router.get("/top-dealers")
def get_top_dealers(
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get top performing dealers"""
    results = db.query(
        Dealer.dealer_name,
        Dealer.city,
        Dealer.state,
        func.count(VehicleSale.id).label('total_sales'),
        func.sum(VehicleSale.total_amount).label('total_revenue')
    ).join(VehicleSale, VehicleSale.dealer_id == Dealer.id)\
     .filter(VehicleSale.sale_status == "delivered")\
     .group_by(Dealer.id)\
     .order_by(func.sum(VehicleSale.total_amount).desc())\
     .limit(limit)\
     .all()
    
    return [
        {
            "dealer_name": r.dealer_name,
            "city": r.city,
            "state": r.state,
            "total_sales": r.total_sales,
            "total_revenue": float(r.total_revenue)
        }
        for r in results
    ]

@router.get("/top-models")
def get_top_models(
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get top selling vehicle models"""
    results = db.query(
        VehicleModel.model_name,
        VehicleModel.variant,
        func.count(VehicleSale.id).label('total_sales'),
        func.sum(VehicleSale.total_amount).label('total_revenue')
    ).join(VehicleBooking, VehicleSale.booking_id == VehicleBooking.id)\
     .join(VehicleModel, VehicleBooking.vehicle_model_id == VehicleModel.id)\
     .filter(VehicleSale.sale_status == "delivered")\
     .group_by(VehicleModel.id)\
     .order_by(func.count(VehicleSale.id).desc())\
     .limit(limit)\
     .all()
    
    return [
        {
            "model_name": r.model_name,
            "variant": r.variant,
            "total_sales": r.total_sales,
            "total_revenue": float(r.total_revenue)
        }
        for r in results
    ]

# ==================== REVENUE ANALYTICS ====================

@router.get("/revenue")
def get_revenue_analytics(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get revenue analytics"""
    if not start_date:
        start_date = date.today().replace(day=1)
    if not end_date:
        end_date = date.today()
    
    sales = db.query(VehicleSale).filter(
        VehicleSale.delivery_date >= start_date,
        VehicleSale.delivery_date <= end_date,
        VehicleSale.sale_status == "delivered"
    ).all()
    
    total_revenue = sum(s.total_amount for s in sales)
    total_tax = sum(s.tax_amount for s in sales)
    total_insurance = sum(s.insurance_amount for s in sales)
    total_registration = sum(s.registration_amount for s in sales)
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "total_sales": len(sales),
        "total_revenue": total_revenue,
        "total_tax": total_tax,
        "total_insurance": total_insurance,
        "total_registration": total_registration,
        "average_price": total_revenue / len(sales) if len(sales) > 0 else 0
    }

# ==================== MONTHLY TRENDS ====================

@router.get("/monthly-trends")
def get_monthly_trends(
    year: int = Query(default=date.today().year),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get monthly sales trends for a year"""
    monthly_data = []
    
    for month in range(1, 13):
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
        
        monthly_data.append({
            "month": month,
            "month_name": date(year, month, 1).strftime("%B"),
            "sales_count": len(sales),
            "revenue": sum(s.total_amount for s in sales)
        })
    
    return {
        "year": year,
        "monthly_data": monthly_data,
        "total_sales": sum(m["sales_count"] for m in monthly_data),
        "total_revenue": sum(m["revenue"] for m in monthly_data)
    }

# ==================== RECENT SALES ====================

@router.get("/recent-sales")
def get_recent_sales(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recent sales with customer details"""
    sales = db.query(VehicleSale).filter(
        VehicleSale.sale_status == "delivered"
    ).order_by(VehicleSale.delivery_date.desc()).limit(limit).all()
    
    result = []
    for sale in sales:
        item = {
            "id": sale.id,
            "sales_invoice_number": sale.sales_invoice_number,
            "delivery_date": sale.delivery_date,
            "total_amount": sale.total_amount
        }
        
        if sale.booking:
            if sale.booking.customer:
                item["customer_name"] = sale.booking.customer.customer_name
                item["customer_city"] = sale.booking.customer.city
            if sale.booking.vehicle_model:
                item["vehicle_model"] = sale.booking.vehicle_model.model_name
            if sale.booking.showroom:
                item["showroom"] = sale.booking.showroom.showroom_name
        if sale.dealer:
            item["dealer"] = sale.dealer.dealer_name
        
        result.append(item)
    
    return result