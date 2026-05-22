from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class ProductionStage(str, enum.Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    QUALITY_CHECK = "quality_check"
    COMPLETED = "completed"
    REJECTED = "rejected"

class VehicleType(str, enum.Enum):
    SEDAN = "sedan"
    SUV = "suv"
    HATCHBACK = "hatchback"
    ELECTRIC = "electric"

class VehicleProduction(Base):
    __tablename__ = "vehicle_production"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_model = Column(String(100), nullable=False)
    vehicle_type = Column(Enum(VehicleType), nullable=False)
    production_line_id = Column(Integer, ForeignKey("production_lines.id"))
    chassis_number = Column(String(50), unique=True, nullable=False, index=True)
    production_stage = Column(Enum(ProductionStage), default=ProductionStage.PLANNED)
    start_date = Column(Date, nullable=False)
    completion_date = Column(Date, nullable=True)
    quantity = Column(Integer, default=1)
    production_cost = Column(Float, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    production_line = relationship("ProductionLine", back_populates="vehicles")
    quality_checks = relationship("QualityCheck", back_populates="vehicle", cascade="all, delete-orphan")