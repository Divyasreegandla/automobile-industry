from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class VehicleBooking(Base):
    __tablename__ = "vehicle_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_number = Column(String(50), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    vehicle_model_id = Column(Integer, ForeignKey("vehicle_models.id"))
    showroom_id = Column(Integer, ForeignKey("showrooms.id"))
    booking_date = Column(Date, nullable=False)
    booking_amount = Column(Float, default=0)
    booking_status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="bookings")
    vehicle_model = relationship("VehicleModel", back_populates="bookings")
    showroom = relationship("Showroom", back_populates="bookings")
    sale = relationship("VehicleSale", back_populates="booking", uselist=False)