from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import (
    auth_router, factory_router, department_router, 
    worker_router, production_line_router, vehicle_production_router,
    quality_check_router, production_dashboard_router,
    machinery_router, robotics_router, maintenance_log_router,
    supplier_router, raw_material_router
)
from app.routers.attendance import router as attendance_router
from app.routers.payroll import router as payroll_router
from app.routers.factory_expense import router as factory_expense_router
from app.routers.warehouse import router as warehouse_router
from app.routers.inventory_transaction import router as inventory_transaction_router
from app.routers.reports import router as reports_router
from app.routers.safety_incident import router as safety_incident_router
from app.routers.iot_monitoring import router as iot_monitoring_router

from app.routers.ai_prediction import router as ai_prediction_router

from app.routers.showroom import router as showroom_router
from app.routers.dealer import router as dealer_router
from app.routers.vehicle_model import router as vehicle_model_router
from app.routers.customer import router as customer_router
from app.routers.booking import router as booking_router
from app.routers.sale import router as sale_router
from app.routers.delivery import router as delivery_router
from app.routers.sales_analytics import router as sales_analytics_router
from app.routers.target import router as target_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Automobile Industry ERP System",
    description="Module 7: Inventory & Raw Material Management",
    version="7.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(factory_router)
app.include_router(department_router)
app.include_router(worker_router)
app.include_router(production_line_router)
app.include_router(vehicle_production_router)
app.include_router(quality_check_router)
app.include_router(production_dashboard_router)
app.include_router(machinery_router)
app.include_router(robotics_router)
app.include_router(maintenance_log_router)
app.include_router(supplier_router)
app.include_router(raw_material_router)
app.include_router(attendance_router)
app.include_router(payroll_router)
app.include_router(factory_expense_router)
app.include_router(warehouse_router)
app.include_router(inventory_transaction_router)
app.include_router(reports_router)
app.include_router(safety_incident_router)
app.include_router(iot_monitoring_router)
app.include_router(ai_prediction_router)

app.include_router(showroom_router)
app.include_router(dealer_router)
app.include_router(vehicle_model_router)
app.include_router(customer_router)
app.include_router(booking_router)
app.include_router(sale_router)
app.include_router(delivery_router)
app.include_router(sales_analytics_router)
app.include_router(target_router)

@app.get("/")
def root():
    return {
        "message": "Automobile Industry ERP System",
        "module": "Inventory & Raw Material Management",
        "status": "running",
        "version": "7.0.0",
        "endpoints": {
            "auth": "/api/v1/auth",
            "factories": "/api/v1/factories",
            "departments": "/api/v1/departments",
            "workers": "/api/v1/workers",
            "production": "/api/v1/production",
            "machinery": "/api/v1/machinery",
            "robotics": "/api/v1/robotics",
            "maintenance": "/api/v1/maintenance",
            "suppliers": "/api/v1/suppliers",
            "raw_materials": "/api/v1/raw-materials"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "modules": ["authentication", "factories", "departments", "workers", 
                    "production", "machinery", "robotics", "maintenance", "inventory"]
    }