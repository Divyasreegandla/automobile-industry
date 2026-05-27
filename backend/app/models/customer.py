from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False, index=True)
    email = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    aadhaar_number = Column(String(12), unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    bookings = relationship("VehicleBooking", back_populates="customer")
    