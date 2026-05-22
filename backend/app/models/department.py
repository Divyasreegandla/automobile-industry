from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    department_name = Column(String(255), nullable=False)
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    factory = relationship("Factory", back_populates="departments")
    workers = relationship("Worker", back_populates="department", cascade="all, delete-orphan")
    production_lines = relationship("ProductionLine", back_populates="department", cascade="all, delete-orphan")
    machinery = relationship("Machinery", back_populates="department", cascade="all, delete-orphan")
    robotics = relationship("Robotics", back_populates="department", cascade="all, delete-orphan")