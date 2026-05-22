from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.factory_expense import FactoryExpense
from app.schemas.factory_expense import (
    FactoryExpenseCreate, FactoryExpenseUpdate, FactoryExpenseResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/expenses", tags=["Cost & Expenses"])

@router.post("/", response_model=FactoryExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_data: FactoryExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new expense record (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can create expenses")
    
    new_expense = FactoryExpense(**expense_data.model_dump())
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/", response_model=List[FactoryExpenseResponse])
def get_all_expenses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    expense_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all expenses with filters"""
    query = db.query(FactoryExpense)
    
    if expense_type:
        query = query.filter(FactoryExpense.expense_type == expense_type)
    if start_date:
        query = query.filter(FactoryExpense.expense_date >= start_date)
    if end_date:
        query = query.filter(FactoryExpense.expense_date <= end_date)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{expense_id}", response_model=FactoryExpenseResponse)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get expense by ID"""
    expense = db.query(FactoryExpense).filter(FactoryExpense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.get("/summary/total")
def get_expense_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get expense summary with totals by type"""
    query = db.query(FactoryExpense)
    
    if start_date:
        query = query.filter(FactoryExpense.expense_date >= start_date)
    if end_date:
        query = query.filter(FactoryExpense.expense_date <= end_date)
    
    expenses = query.all()
    
    total_amount = sum(e.amount for e in expenses)
    
    # Group by expense type
    by_type = {}
    for expense in expenses:
        if expense.expense_type not in by_type:
            by_type[expense.expense_type] = 0
        by_type[expense.expense_type] += expense.amount
    
    return {
        "total_expenses": len(expenses),
        "total_amount": total_amount,
        "expenses_by_type": by_type,
        "period": {
            "start_date": start_date,
            "end_date": end_date
        }
    }

@router.put("/{expense_id}", response_model=FactoryExpenseResponse)
def update_expense(
    expense_id: int,
    expense_data: FactoryExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update expense record (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can update expenses")
    
    expense = db.query(FactoryExpense).filter(FactoryExpense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    for key, value in expense_data.model_dump(exclude_unset=True).items():
        setattr(expense, key, value)
    
    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete expense record (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete expenses")
    
    expense = db.query(FactoryExpense).filter(FactoryExpense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(expense)
    db.commit()
    return None