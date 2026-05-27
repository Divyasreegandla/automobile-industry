from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app.models.sales_target import SalesTarget
from app.models.regional_sales_report import RegionalSalesReport
from app.models.showroom import Showroom
from app.models.vehicle_sale import VehicleSale
from app.models.vehicle_booking import VehicleBooking
from app.schemas.sales_target import SalesTargetCreate, SalesTargetUpdate, SalesTargetResponse
from app.schemas.regional_sales_report import RegionalSalesReportCreate, RegionalSalesReportUpdate, RegionalSalesReportResponse
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/targets", tags=["Sales Targets"])

# ==================== Sales Target Endpoints ====================

@router.post("/", response_model=SalesTargetResponse, status_code=status.HTTP_201_CREATED)
def create_target(
    data: SalesTargetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if showroom exists
    showroom = db.query(Showroom).filter(Showroom.id == data.showroom_id).first()
    if not showroom:
        raise HTTPException(status_code=404, detail="Showroom not found")
    
    # Check if target already exists for this month/year
    existing = db.query(SalesTarget).filter(
        SalesTarget.showroom_id == data.showroom_id,
        SalesTarget.target_month == data.target_month,
        SalesTarget.target_year == data.target_year
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Target already set for this month")
    
    new_target = SalesTarget(**data.model_dump())
    db.add(new_target)
    db.commit()
    db.refresh(new_target)
    
    response = SalesTargetResponse.model_validate(new_target)
    response.showroom_name = showroom.showroom_name
    return response

@router.get("/", response_model=List[SalesTargetResponse])
def get_targets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    showroom_id: Optional[int] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(SalesTarget)
    
    if showroom_id:
        query = query.filter(SalesTarget.showroom_id == showroom_id)
    if year:
        query = query.filter(SalesTarget.target_year == year)
    if month:
        query = query.filter(SalesTarget.target_month == month)
    
    targets = query.offset(skip).limit(limit).all()
    
    result = []
    for t in targets:
        response = SalesTargetResponse.model_validate(t)
        if t.showroom:
            response.showroom_name = t.showroom.showroom_name
            if t.target_count > 0:
                response.achievement_percentage = (t.achieved_count / t.target_count) * 100
            if t.target_revenue > 0:
                response.revenue_achievement_percentage = (t.achieved_revenue / t.target_revenue) * 100
        result.append(response)
    
    return result

@router.get("/performance")
def get_target_performance(
    year: int = Query(default=date.today().year),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get target performance summary for all showrooms"""
    
    # Get actual sales per showroom for the year
    actual_sales = db.query(
        Showroom.id,
        Showroom.showroom_name,
        extract('month', VehicleSale.delivery_date).label('month'),
        func.count(VehicleSale.id).label('actual_count'),
        func.sum(VehicleSale.total_amount).label('actual_revenue')
    ).join(VehicleBooking, VehicleSale.booking_id == VehicleBooking.id)\
     .join(Showroom, VehicleBooking.showroom_id == Showroom.id)\
     .filter(VehicleSale.sale_status == "delivered")\
     .filter(extract('year', VehicleSale.delivery_date) == year)\
     .group_by(Showroom.id, Showroom.showroom_name, extract('month', VehicleSale.delivery_date))\
     .all()
    
    # Get targets
    targets = db.query(SalesTarget).filter(SalesTarget.target_year == year).all()
    
    # Create a map of actual sales
    actual_map = {}
    for sale in actual_sales:
        key = (sale.id, sale.month)
        actual_map[key] = {
            "actual_count": sale.actual_count,
            "actual_revenue": float(sale.actual_revenue)
        }
    
    # Prepare performance data
    showroom_targets = {}
    
    for target in targets:
        if target.showroom_id not in showroom_targets:
            showroom_targets[target.showroom_id] = {
                "showroom_name": target.showroom.showroom_name if target.showroom else "Unknown",
                "target_count": 0,
                "target_revenue": 0,
                "achieved_count": 0,
                "achieved_revenue": 0
            }
        
        showroom_targets[target.showroom_id]["target_count"] += target.target_count
        showroom_targets[target.showroom_id]["target_revenue"] += target.target_revenue
        
        key = (target.showroom_id, target.target_month)
        if key in actual_map:
            showroom_targets[target.showroom_id]["achieved_count"] += actual_map[key]["actual_count"]
            showroom_targets[target.showroom_id]["achieved_revenue"] += actual_map[key]["actual_revenue"]
    
    performance = []
    for showroom_id, data in showroom_targets.items():
        count_percentage = (data["achieved_count"] / data["target_count"] * 100) if data["target_count"] > 0 else 0
        revenue_percentage = (data["achieved_revenue"] / data["target_revenue"] * 100) if data["target_revenue"] > 0 else 0
        
        performance.append({
            "showroom_id": showroom_id,
            "showroom_name": data["showroom_name"],
            "target_count": data["target_count"],
            "achieved_count": data["achieved_count"],
            "count_achievement": round(count_percentage, 2),
            "target_revenue": data["target_revenue"],
            "achieved_revenue": data["achieved_revenue"],
            "revenue_achievement": round(revenue_percentage, 2)
        })
    
    return {
        "year": year,
        "performance": sorted(performance, key=lambda x: x["count_achievement"], reverse=True)
    }

@router.get("/monthly-summary")
def get_monthly_target_summary(
    year: int = Query(default=date.today().year),
    month: int = Query(default=date.today().month),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get monthly target summary for all showrooms"""
    
    targets = db.query(SalesTarget).filter(
        SalesTarget.target_year == year,
        SalesTarget.target_month == month
    ).all()
    
    total_target_count = sum(t.target_count for t in targets)
    total_achieved_count = sum(t.achieved_count for t in targets)
    total_target_revenue = sum(t.target_revenue for t in targets)
    total_achieved_revenue = sum(t.achieved_revenue for t in targets)
    
    return {
        "year": year,
        "month": month,
        "summary": {
            "total_target_count": total_target_count,
            "total_achieved_count": total_achieved_count,
            "count_achievement": (total_achieved_count / total_target_count * 100) if total_target_count > 0 else 0,
            "total_target_revenue": total_target_revenue,
            "total_achieved_revenue": total_achieved_revenue,
            "revenue_achievement": (total_achieved_revenue / total_target_revenue * 100) if total_target_revenue > 0 else 0
        }
    }

@router.put("/{target_id}", response_model=SalesTargetResponse)
def update_target(
    target_id: int,
    data: SalesTargetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    target = db.query(SalesTarget).filter(SalesTarget.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(target, key, value)
    
    db.commit()
    db.refresh(target)
    
    response = SalesTargetResponse.model_validate(target)
    if target.showroom:
        response.showroom_name = target.showroom.showroom_name
    return response

@router.delete("/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_target(
    target_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    target = db.query(SalesTarget).filter(SalesTarget.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    db.delete(target)
    db.commit()
    return None

# ==================== Regional Sales Report Endpoints ====================

@router.post("/regional-reports", response_model=RegionalSalesReportResponse, status_code=status.HTTP_201_CREATED)
def create_regional_report(
    data: RegionalSalesReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    existing = db.query(RegionalSalesReport).filter(
        RegionalSalesReport.state == data.state,
        RegionalSalesReport.report_month == data.report_month,
        RegionalSalesReport.report_year == data.report_year
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Report already exists for this period")
    
    new_report = RegionalSalesReport(**data.model_dump())
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@router.get("/regional-reports", response_model=List[RegionalSalesReportResponse])
def get_regional_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    state: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(RegionalSalesReport)
    
    if state:
        query = query.filter(RegionalSalesReport.state == state)
    if year:
        query = query.filter(RegionalSalesReport.report_year == year)
    if month:
        query = query.filter(RegionalSalesReport.report_month == month)
    
    return query.offset(skip).limit(limit).all()

@router.get("/regional-summary")
def get_regional_summary(
    year: int = Query(default=date.today().year),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get regional sales summary"""
    reports = db.query(RegionalSalesReport).filter(
        RegionalSalesReport.report_year == year
    ).all()
    
    state_summary = {}
    for report in reports:
        if report.state not in state_summary:
            state_summary[report.state] = {
                "total_sales": 0,
                "total_revenue": 0
            }
        state_summary[report.state]["total_sales"] += report.total_sales
        state_summary[report.state]["total_revenue"] += report.total_revenue
    
    return {
        "year": year,
        "state_summary": [
            {
                "state": state,
                "total_sales": data["total_sales"],
                "total_revenue": data["total_revenue"]
            }
            for state, data in state_summary.items()
        ]
    }