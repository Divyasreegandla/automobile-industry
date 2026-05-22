from app.routers.auth import router as auth_router
from app.routers.factory import router as factory_router
from app.routers.department import router as department_router
from app.routers.worker import router as worker_router
from app.routers.production_line import router as production_line_router
from app.routers.vehicle_production import router as vehicle_production_router
from app.routers.quality_check import router as quality_check_router
from app.routers.production_dashboard import router as production_dashboard_router
from app.routers.machinery import router as machinery_router
from app.routers.robotics import router as robotics_router
from app.routers.maintenance_log import router as maintenance_log_router
from app.routers.supplier import router as supplier_router
from app.routers.raw_material import router as raw_material_router
from app.routers.attendance import router as attendance_router
from app.routers.payroll import router as payroll_router
from app.routers.factory_expense import router as factory_expense_router
from app.routers.warehouse import router as warehouse_router
from app.routers.inventory_transaction import router as inventory_transaction_router
from app.routers.reports import router as reports_router
from app.routers.safety_incident import router as safety_incident_router
from app.routers.iot_monitoring import router as iot_monitoring_router

from app.routers.ai_prediction import router as ai_prediction_router

__all__ = [
    "auth_router", 
    "factory_router", 
    "department_router", 
    "worker_router",
    "production_line_router",
    "vehicle_production_router", 
    "quality_check_router",
    "production_dashboard_router",
    "machinery_router",
    "robotics_router",
    "maintenance_log_router",
    "supplier_router",
    "raw_material_router",
    "attendance_router",
    "payroll_router",
    "factory_expense_router",
    "warehouse_router",
    "inventory_transaction_router",
    "reports_router",
    "safety_incident_router",
    "iot_monitoring_router",
    "ai_prediction_router"
]