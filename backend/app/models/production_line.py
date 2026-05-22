from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.vehicle_production import VehicleType

class ProductionLine(Base):
    __tablename__ = "production_lines"
    
    id = Column(Integer, primary_key=True, index=True)
    line_name = Column(String(100), nullable=False)
    line_code = Column(String(50), unique=True, nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    vehicle_type = Column(Enum(VehicleType), nullable=False)
    target_per_day = Column(Integer, default=0)
    current_output = Column(Integer, default=0)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    department = relationship("Department", back_populates="production_lines")
    vehicles = relationship("VehicleProduction", back_populates="production_line", cascade="all, delete-orphan")