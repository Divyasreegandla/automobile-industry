from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum
from sqlalchemy.orm import relationship

class FuelType(str, enum.Enum):
    PETROL = "petrol"
    DIESEL = "diesel"
    ELECTRIC = "electric"
    HYBRID = "hybrid"

class TransmissionType(str, enum.Enum):
    MANUAL = "manual"
    AUTOMATIC = "automatic"

class VehicleModel(Base):
    __tablename__ = "vehicle_models"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(255), nullable=False)
    variant = Column(String(100), nullable=False)
    fuel_type = Column(Enum(FuelType), nullable=False)
    transmission = Column(Enum(TransmissionType), nullable=False)
    ex_showroom_price = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    bookings = relationship("VehicleBooking", back_populates="vehicle_model")
