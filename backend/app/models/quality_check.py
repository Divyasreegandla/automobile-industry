from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class QualityCheck(Base):
    __tablename__ = "quality_checks"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_production_id = Column(Integer, ForeignKey("vehicle_production.id"))
    checked_by = Column(Integer, ForeignKey("workers.id"))
    check_date = Column(Date, nullable=False)
    quality_status = Column(String(50), default="pending")
    defect_type = Column(String(200), nullable=True)
    remarks = Column(Text, nullable=True)
    rework_required = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    vehicle = relationship("VehicleProduction", back_populates="quality_checks")
    inspector = relationship("Worker", foreign_keys=[checked_by])