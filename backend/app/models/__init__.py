# Existing models
from app.models.user import User
from app.models.factory import Factory
from app.models.department import Department
from app.models.worker import Worker
from app.models.production_line import ProductionLine
from app.models.vehicle_production import VehicleProduction
from app.models.quality_check import QualityCheck
from app.models.machinery import Machinery
from app.models.robotics import Robotics
from app.models.maintenance_log import MaintenanceLog
from app.models.supplier import Supplier
from app.models.raw_material import RawMaterial
from app.models.attendance import Attendance
from app.models.payroll import Payroll
from app.models.factory_expense import FactoryExpense
from app.models.warehouse import Warehouse
from app.models.inventory_transaction import InventoryTransaction
from app.models.safety_incident import SafetyIncident

from app.models.showroom import Showroom
from app.models.dealer import Dealer
from app.models.vehicle_model import VehicleModel
from app.models.customer import Customer
from app.models.vehicle_booking import VehicleBooking
from app.models.customer import Customer
from app.models.vehicle_booking import VehicleBooking
from app.models.vehicle_sale import VehicleSale
from app.models.delivery_tracking import DeliveryTracking
from app.models.sales_target import SalesTarget
from app.models.regional_sales_report import RegionalSalesReport

__all__ = [
    "User", "Factory", "Department", "Worker",
    "ProductionLine", "VehicleProduction", "QualityCheck",
    "Machinery", "Robotics", "MaintenanceLog",
    "Supplier", "RawMaterial", "Attendance", "Payroll",
    "FactoryExpense", "Warehouse", "InventoryTransaction", "SafetyIncident",
    "Showroom", "Dealer", "VehicleModel", "Customer", "VehicleBooking",
    "Customer", "VehicleBooking","VehicleSale", "DeliveryTracking",
    "SalesTarget", "RegionalSalesReport"
]