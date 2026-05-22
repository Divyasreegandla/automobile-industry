from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import date, datetime, timedelta
from typing import Optional
from app.database import get_db
from app.models.production_line import ProductionLine
from app.models.vehicle_production import VehicleProduction
from app.models.quality_check import QualityCheck
from app.models.worker import Worker
from app.models.attendance import Attendance
from app.models.payroll import Payroll
from app.models.factory_expense import FactoryExpense
from app.models.machinery import Machinery
from app.models.maintenance_log import MaintenanceLog
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/reports", tags=["Reports & Analytics"])

# ==================== Production Reports ====================

@router.get("/production/daily")
def get_daily_production_report(
    report_date: date = Query(default=date.today(), description="Report date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get daily production report"""
    
    completed = db.query(VehicleProduction).filter(
        VehicleProduction.completion_date == report_date
    ).count()
    
    by_stage = db.query(
        VehicleProduction.production_stage,
        func.count(VehicleProduction.id).label('count')
    ).group_by(VehicleProduction.production_stage).all()
    
    return {
        "report_date": report_date,
        "summary": {
            "vehicles_completed": completed
        },
        "production_by_stage": {stage: count for stage, count in by_stage}
    }

@router.get("/production/monthly")
def get_monthly_production_report(
    year: int = Query(default=date.today().year),
    month: int = Query(default=date.today().month),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get monthly production report"""
    
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)
    
    completed = db.query(VehicleProduction).filter(
        and_(
            VehicleProduction.completion_date >= start_date,
            VehicleProduction.completion_date < end_date
        )
    ).count()
    
    total_cost = db.query(func.sum(VehicleProduction.production_cost)).filter(
        and_(
            VehicleProduction.completion_date >= start_date,
            VehicleProduction.completion_date < end_date
        )
    ).scalar() or 0
    
    return {
        "year": year,
        "month": month,
        "vehicles_completed": completed,
        "total_production_cost": float(total_cost),
        "average_cost_per_vehicle": float(total_cost / completed) if completed > 0 else 0
    }

# ==================== Quality Reports ====================

@router.get("/quality/summary")
def get_quality_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get quality control summary report"""
    
    query = db.query(QualityCheck)
    
    if start_date:
        query = query.filter(QualityCheck.check_date >= start_date)
    if end_date:
        query = query.filter(QualityCheck.check_date <= end_date)
    
    checks = query.all()
    
    total = len(checks)
    passed = len([c for c in checks if c.quality_status == "passed"])
    failed = len([c for c in checks if c.quality_status == "failed"])
    
    return {
        "total_checks": total,
        "passed": passed,
        "failed": failed,
        "pass_rate": round((passed / total * 100), 2) if total > 0 else 0,
        "fail_rate": round((failed / total * 100), 2) if total > 0 else 0
    }

# ==================== Cost Reports ====================

@router.get("/cost/expenses")
def get_expense_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get expense report for date range"""
    
    expenses = db.query(FactoryExpense).filter(
        and_(
            FactoryExpense.expense_date >= start_date,
            FactoryExpense.expense_date <= end_date
        )
    ).all()
    
    total = sum(e.amount for e in expenses)
    
    by_type = {}
    for expense in expenses:
        if expense.expense_type not in by_type:
            by_type[expense.expense_type] = 0
        by_type[expense.expense_type] += expense.amount
    
    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_expenses": len(expenses),
        "total_amount": total,
        "expenses_by_type": by_type
    }

# ==================== Machine Performance Reports ====================

@router.get("/machinery/performance")
def get_machine_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get machine performance report"""
    
    machines = db.query(Machinery).all()
    
    performance = []
    for machine in machines:
        maintenance_logs = db.query(MaintenanceLog).filter(
            MaintenanceLog.machine_id == machine.id
        ).all()
        
        total_maintenance_cost = sum(log.maintenance_cost for log in maintenance_logs)
        total_downtime = sum(log.downtime_hours for log in maintenance_logs)
        
        performance.append({
            "machine_id": machine.id,
            "machine_name": machine.machine_name,
            "running_hours": machine.running_hours,
            "maintenance_count": len(maintenance_logs),
            "total_maintenance_cost": total_maintenance_cost,
            "total_downtime_hours": total_downtime,
            "status": machine.current_status
        })
    
    return performance

# ==================== Attendance Reports ====================

@router.get("/attendance/monthly")
def get_monthly_attendance(
    year: int = Query(default=date.today().year),
    month: int = Query(default=date.today().month),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get monthly attendance report"""
    
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)
    
    attendance = db.query(Attendance).filter(
        and_(
            Attendance.attendance_date >= start_date,
            Attendance.attendance_date < end_date
        )
    ).all()
    
    total_present = len(attendance)
    total_overtime = sum(a.overtime_hours for a in attendance)
    
    return {
        "year": year,
        "month": month,
        "total_attendance_records": total_present,
        "total_overtime_hours": total_overtime
    }

# ==================== Payroll Reports ====================

@router.get("/payroll/monthly")
def get_monthly_payroll(
    year: int = Query(default=date.today().year),
    month: int = Query(default=date.today().month),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get monthly payroll report"""
    
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)
    
    payroll = db.query(Payroll).filter(
        and_(
            Payroll.payment_date >= start_date,
            Payroll.payment_date < end_date
        )
    ).all()
    
    total_salary = sum(p.final_salary for p in payroll)
    total_paid = sum(p.final_salary for p in payroll if p.payment_status == "paid")
    total_pending = sum(p.final_salary for p in payroll if p.payment_status == "pending")
    
    return {
        "year": year,
        "month": month,
        "total_employees": len(payroll),
        "total_salary_amount": total_salary,
        "paid_amount": total_paid,
        "pending_amount": total_pending
    }

# ==================== Dashboard Analytics ====================

@router.get("/dashboard")
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get main dashboard analytics"""
    
    # Today's date
    today = date.today()
    month_start = date(today.year, today.month, 1)
    
    # Production stats
    total_production = db.query(VehicleProduction).count()
    completed_today = db.query(VehicleProduction).filter(
        VehicleProduction.completion_date == today
    ).count()
    
    # Quality stats
    quality_checks = db.query(QualityCheck).count()
    quality_passed = db.query(QualityCheck).filter(
        QualityCheck.quality_status == "passed"
    ).count()
    
    # Employee stats
    total_workers = db.query(Worker).count()
    active_workers = db.query(Worker).filter(Worker.status == "active").count()
    
    # Financial stats
    monthly_expenses = db.query(func.sum(FactoryExpense.amount)).filter(
        FactoryExpense.expense_date >= month_start
    ).scalar() or 0
    
    monthly_payroll = db.query(func.sum(Payroll.final_salary)).filter(
        Payroll.payment_date >= month_start
    ).scalar() or 0
    
    # Machine stats
    total_machines = db.query(Machinery).count()
    machines_operational = db.query(Machinery).filter(
        Machinery.current_status == "operational"
    ).count()
    
    return {
        "production": {
            "total_production": total_production,
            "completed_today": completed_today
        },
        "quality": {
            "total_checks": quality_checks,
            "passed": quality_passed,
            "pass_rate": round((quality_passed / quality_checks * 100), 2) if quality_checks > 0 else 0
        },
        "employees": {
            "total_workers": total_workers,
            "active_workers": active_workers
        },
        "financial": {
            "monthly_expenses": round(monthly_expenses, 2),
            "monthly_payroll": round(monthly_payroll, 2)
        },
        "machinery": {
            "total_machines": total_machines,
            "operational": machines_operational
        }
    }