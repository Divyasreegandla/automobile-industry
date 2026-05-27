from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class DeliveryStatus(str, enum.Enum):
    PENDING = "pending"
    DISPATCHED = "dispatched"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    DELAYED = "delayed"
    CANCELLED = "cancelled"

class DeliveryTracking(Base):
    __tablename__ = "delivery_tracking"
    
    id = Column(Integer, primary_key=True, index=True)
    sales_id = Column(Integer, ForeignKey("vehicle_sales.id"), unique=True)
    vehicle_dispatch_date = Column(Date, nullable=True)
    expected_delivery = Column(Date, nullable=False)
    actual_delivery = Column(Date, nullable=True)
    delivery_status = Column(Enum(DeliveryStatus), default=DeliveryStatus.PENDING)
    tracking_number = Column(String(100), unique=True, nullable=True)
    carrier_name = Column(String(255), nullable=True)
    driver_name = Column(String(255), nullable=True)
    driver_phone = Column(String(20), nullable=True)
    current_location = Column(String(500), nullable=True)
    last_updated = Column(DateTime(timezone=True), onupdate=func.now())
    remarks = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    sale = relationship("VehicleSale", back_populates="delivery")