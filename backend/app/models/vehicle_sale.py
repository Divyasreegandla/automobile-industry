from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class SaleStatus(str, enum.Enum):
    BOOKED = "booked"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class VehicleSale(Base):
    __tablename__ = "vehicle_sales"
    
    id = Column(Integer, primary_key=True, index=True)
    sales_invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("vehicle_bookings.id"))
    dealer_id = Column(Integer, ForeignKey("dealers.id"))
    delivery_date = Column(Date, nullable=True)
    
    # Selling price components
    final_price = Column(Float, default=0)
    tax_amount = Column(Float, default=0)
    insurance_amount = Column(Float, default=0)
    registration_amount = Column(Float, default=0)
    total_amount = Column(Float, default=0)
    discount_amount = Column(Float, default=0)
    
    # Cost components (NEW for Revenue & Profit)
    manufacturing_cost = Column(Float, default=0)      # Cost to manufacture
    transportation_cost = Column(Float, default=0)     # Logistics cost
    dealer_commission = Column(Float, default=0)       # Commission to dealer
    marketing_cost = Column(Float, default=0)          # Marketing expenses
    overhead_cost = Column(Float, default=0)           # Administrative overhead
    
    # Profit calculations
    total_cost = Column(Float, default=0)              # Sum of all costs
    gross_profit = Column(Float, default=0)            # Revenue - manufacturing cost
    net_profit = Column(Float, default=0)              # Final profit after all costs
    profit_margin = Column(Float, default=0)           # Profit percentage
    
    sale_status = Column(Enum(SaleStatus), default=SaleStatus.BOOKED)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    booking = relationship("VehicleBooking", back_populates="sale")
    dealer = relationship("Dealer", back_populates="sales")
    delivery = relationship("DeliveryTracking", back_populates="sale", uselist=False)
    