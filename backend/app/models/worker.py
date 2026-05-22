from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, Enum, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class EmploymentStatus(str, enum.Enum):
    ACTIVE = "active"
    ON_LEAVE = "on_leave"
    SUSPENDED = "suspended"
    TERMINATED = "terminated"

class ShiftType(str, enum.Enum):
    MORNING = "morning"
    EVENING = "evening"
    NIGHT = "night"
    GENERAL = "general"

class Worker(Base):
    __tablename__ = "workers"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(20))
    address = Column(String(500))
    designation = Column(String(100))
    department_id = Column(Integer, ForeignKey("departments.id"))
    joining_date = Column(Date, nullable=False)
    basic_salary = Column(Float, default=0)
    shift_type = Column(Enum(ShiftType), default=ShiftType.GENERAL)
    status = Column(Enum(EmploymentStatus), default=EmploymentStatus.ACTIVE)
    emergency_contact_name = Column(String(255))
    emergency_contact_phone = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    department = relationship("Department", back_populates="workers")
    quality_checks = relationship("QualityCheck", foreign_keys="QualityCheck.checked_by", back_populates="inspector")
    attendance = relationship("Attendance", back_populates="worker", cascade="all, delete-orphan")
    payroll = relationship("Payroll", back_populates="worker", cascade="all, delete-orphan")
    safety_incidents = relationship("SafetyIncident", back_populates="worker", cascade="all, delete-orphan")
    