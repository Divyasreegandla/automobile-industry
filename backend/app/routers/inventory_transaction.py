from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.inventory_transaction import InventoryTransaction
from app.models.raw_material import RawMaterial
from app.schemas.inventory_transaction import (
    InventoryTransactionCreate, InventoryTransactionUpdate, InventoryTransactionResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/inventory/transactions", tags=["Inventory Transactions"])

@router.post("/", response_model=InventoryTransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_data: InventoryTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create inventory transaction (Admin/Manager only)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can create transactions")
    
    material = db.query(RawMaterial).filter(RawMaterial.id == transaction_data.material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Update stock quantity based on transaction type
    if transaction_data.transaction_type == "IN":
        material.stock_quantity += transaction_data.quantity
    elif transaction_data.transaction_type == "OUT":
        if material.stock_quantity < transaction_data.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        material.stock_quantity -= transaction_data.quantity
    elif transaction_data.transaction_type == "RETURN":
        material.stock_quantity += transaction_data.quantity
    
    new_transaction = InventoryTransaction(**transaction_data.model_dump())
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction

@router.get("/", response_model=List[InventoryTransactionResponse])
def get_all_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    material_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all inventory transactions with filters"""
    query = db.query(InventoryTransaction)
    
    if material_id:
        query = query.filter(InventoryTransaction.material_id == material_id)
    if transaction_type:
        query = query.filter(InventoryTransaction.transaction_type == transaction_type)
    if start_date:
        query = query.filter(InventoryTransaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(InventoryTransaction.transaction_date <= end_date)
    
    return query.offset(skip).limit(limit).all()

@router.get("/material/{material_id}")
def get_material_transactions(
    material_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all transactions for a specific material"""
    material = db.query(RawMaterial).filter(RawMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    transactions = db.query(InventoryTransaction).filter(
        InventoryTransaction.material_id == material_id
    ).offset(skip).limit(limit).all()
    
    return {
        "material_id": material_id,
        "material_name": material.material_name,
        "current_stock": material.stock_quantity,
        "total_transactions": len(transactions),
        "transactions": transactions
    }

@router.get("/{transaction_id}", response_model=InventoryTransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get transaction by ID"""
    transaction = db.query(InventoryTransaction).filter(InventoryTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete transaction (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete transactions")
    
    transaction = db.query(InventoryTransaction).filter(InventoryTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(transaction)
    db.commit()
    return None