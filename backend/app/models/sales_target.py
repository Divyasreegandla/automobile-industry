from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class SalesTarget(Base):
    __tablename__ = "sales_targets"
    
    id = Column(Integer, primary_key=True, index=True)
    showroom_id = Column(Integer, ForeignKey("showrooms.id"))
    target_month = Column(Integer, nullable=False)  # 1-12
    target_year = Column(Integer, nullable=False)
    target_count = Column(Integer, default=0)
    achieved_count = Column(Integer, default=0)
    target_revenue = Column(Float, default=0)
    achieved_revenue = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    showroom = relationship("Showroom", back_populates="sales_targets")