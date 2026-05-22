from sqlalchemy import Column, Enum, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class MaintenanceType(str, enum.Enum):
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    EMERGENCY = "emergency"
    CALIBRATION = "calibration"
    UPGRADE = "upgrade"

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machinery.id"), nullable=True)
    robot_id = Column(Integer, ForeignKey("robotics.id"), nullable=True)
    maintenance_type = Column(Enum(MaintenanceType), nullable=False)
    maintenance_date = Column(Date, nullable=False)
    technician_name = Column(String(255), nullable=False)
    technician_contact = Column(String(50))
    description = Column(Text, nullable=True)
    maintenance_cost = Column(Float, default=0)
    parts_replaced = Column(Text, nullable=True)
    downtime_hours = Column(Float, default=0)
    next_maintenance_due = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    machine = relationship("Machinery", back_populates="maintenance_logs")
    robot = relationship("Robotics", back_populates="maintenance_logs")