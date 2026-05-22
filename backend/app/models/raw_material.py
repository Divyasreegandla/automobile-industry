from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class RawMaterial(Base):
    __tablename__ = "raw_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    material_code = Column(String(50), unique=True, nullable=False, index=True)
    material_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    stock_quantity = Column(Float, default=0)
    unit = Column(String(20), default="kg")  # kg, liter, piece, meter
    unit_price = Column(Float, default=0)
    minimum_stock = Column(Float, default=0)
    maximum_stock = Column(Float, default=0)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    location = Column(String(255), nullable=True)  # Warehouse location
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    supplier = relationship("Supplier", back_populates="raw_materials")
    transactions = relationship("InventoryTransaction", back_populates="material", cascade="all, delete-orphan")
    