from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Showroom(Base):
    __tablename__ = "showrooms"
    
    id = Column(Integer, primary_key=True, index=True)
    showroom_code = Column(String(50), unique=True, nullable=False, index=True)
    showroom_name = Column(String(255), nullable=False)
    state = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    address = Column(String(500), nullable=True)
    manager_name = Column(String(255), nullable=False)
    contact_number = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    dealers = relationship("Dealer", back_populates="showroom", cascade="all, delete-orphan")
    bookings = relationship("VehicleBooking", back_populates="showroom")
    sales_targets = relationship("SalesTarget", back_populates="showroom", cascade="all, delete-orphan")
    