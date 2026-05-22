from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class MachineStatus(str, enum.Enum):
    OPERATIONAL = "operational"
    MAINTENANCE = "maintenance"
    REPAIR = "repair"
    IDLE = "idle"
    DECOMMISSIONED = "decommissioned"

class Machinery(Base):
    __tablename__ = "machinery"
    
    id = Column(Integer, primary_key=True, index=True)
    machine_code = Column(String(50), unique=True, nullable=False, index=True)
    machine_name = Column(String(255), nullable=False)
    machine_type = Column(String(100), nullable=False)
    manufacturer = Column(String(255))
    model_number = Column(String(100))
    department_id = Column(Integer, ForeignKey("departments.id"))
    purchase_date = Column(Date, nullable=False)
    purchase_cost = Column(Float, default=0)
    warranty_expiry = Column(Date, nullable=True)
    maintenance_cycle_days = Column(Integer, default=30)
    current_status = Column(Enum(MachineStatus), default=MachineStatus.OPERATIONAL)
    running_hours = Column(Float, default=0)
    last_maintenance_date = Column(Date, nullable=True)
    next_maintenance_date = Column(Date, nullable=True)
    specifications = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    department = relationship("Department", back_populates="machinery")
    maintenance_logs = relationship("MaintenanceLog", back_populates="machine", cascade="all, delete-orphan")