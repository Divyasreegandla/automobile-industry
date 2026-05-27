from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.sql import func
from app.database import Base

class RegionalSalesReport(Base):
    __tablename__ = "regional_sales_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=True)
    total_sales = Column(Integer, default=0)
    total_revenue = Column(Float, default=0)
    report_month = Column(Integer, nullable=False)  # 1-12
    report_year = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())