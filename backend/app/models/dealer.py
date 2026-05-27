from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Dealer(Base):
    __tablename__ = "dealers"
    
    id = Column(Integer, primary_key=True, index=True)
    dealer_code = Column(String(50), unique=True, nullable=False, index=True)
    dealer_name = Column(String(255), nullable=False)
    showroom_id = Column(Integer, ForeignKey("showrooms.id"))
    state = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    contact_person = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    showroom = relationship("Showroom", back_populates="dealers")
    sales = relationship("VehicleSale", back_populates="dealer")
