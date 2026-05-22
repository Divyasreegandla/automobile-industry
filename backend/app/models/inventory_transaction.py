from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("raw_materials.id"), nullable=False)
    transaction_type = Column(String(50), nullable=False)  # IN, OUT, RETURN, ADJUST
    quantity = Column(Float, default=0)
    transaction_date = Column(Date, nullable=False)
    remarks = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    material = relationship("RawMaterial", back_populates="transactions")