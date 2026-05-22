from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class FactoryExpense(Base):
    __tablename__ = "factory_expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    expense_type = Column(String(100), nullable=False)
    amount = Column(Float, default=0)
    expense_date = Column(Date, nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())