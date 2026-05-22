from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class RobotStatus(str, enum.Enum):
    OPERATIONAL = "operational"
    CHARGING = "charging"
    MAINTENANCE = "maintenance"
    CALIBRATION = "calibration"
    ERROR = "error"
    IDLE = "idle"

class AutomationType(str, enum.Enum):
    ASSEMBLY = "assembly"
    WELDING = "welding"
    PAINTING = "painting"
    PACKAGING = "packaging"
    INSPECTION = "inspection"
    MATERIAL_HANDLING = "material_handling"

class Robotics(Base):
    __tablename__ = "robotics"
    
    id = Column(Integer, primary_key=True, index=True)
    robot_code = Column(String(50), unique=True, nullable=False, index=True)
    robot_name = Column(String(255), nullable=False)
    automation_type = Column(Enum(AutomationType), nullable=False)
    manufacturer = Column(String(255))
    model_number = Column(String(100))
    department_id = Column(Integer, ForeignKey("departments.id"))
    purchase_date = Column(Date, nullable=False)
    purchase_cost = Column(Float, default=0)
    warranty_expiry = Column(Date, nullable=True)
    maintenance_cycle_days = Column(Integer, default=90)
    current_status = Column(Enum(RobotStatus), default=RobotStatus.OPERATIONAL)
    operating_hours = Column(Float, default=0)
    energy_consumption = Column(Float, default=0)
    last_maintenance_date = Column(Date, nullable=True)
    next_maintenance_date = Column(Date, nullable=True)
    software_version = Column(String(50))
    firmware_version = Column(String(50))
    specifications = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    department = relationship("Department", back_populates="robotics")
    maintenance_logs = relationship("MaintenanceLog", back_populates="robot", cascade="all, delete-orphan")