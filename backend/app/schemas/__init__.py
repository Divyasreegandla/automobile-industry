from app.schemas.auth import UserCreate, LoginRequest, TokenResponse, UserResponse
from app.schemas.factory import (
    FactoryCreate, FactoryUpdate, FactoryResponse,
    FactoryWithDepartmentsResponse
)
from app.schemas.department import (
    DepartmentCreate, DepartmentUpdate, DepartmentResponse
)
from app.schemas.worker import (
    WorkerCreate, WorkerUpdate, WorkerResponse, WorkerWithDepartmentResponse,
    EmploymentStatusEnum, ShiftTypeEnum
)
from app.schemas.production_line import (
    ProductionLineCreate, ProductionLineUpdate, ProductionLineResponse,
    ProductionLineWithVehiclesResponse
)
from app.schemas.vehicle_production import (
    VehicleProductionCreate, VehicleProductionUpdate, VehicleProductionResponse,
    ProductionStageEnum, VehicleTypeEnum
)
from app.schemas.quality_check import (
    QualityCheckCreate, QualityCheckUpdate, QualityCheckResponse
)
from app.schemas.production_stats import ProductionStats
from app.schemas.machinery import (
    MachineryCreate, MachineryUpdate, MachineryResponse, MachineStatusEnum
)
from app.schemas.robotics import (
    RoboticsCreate, RoboticsUpdate, RoboticsResponse,
    RobotStatusEnum, AutomationTypeEnum
)
from app.schemas.maintenance_log import (
    MaintenanceLogCreate, MaintenanceLogUpdate, MaintenanceLogResponse,
    MaintenanceTypeEnum
)
from app.schemas.supplier import (
    SupplierCreate, SupplierUpdate, SupplierResponse
)
from app.schemas.raw_material import (
    RawMaterialCreate, RawMaterialUpdate, RawMaterialResponse,
    RawMaterialWithSupplierResponse
)
from app.schemas.attendance import (
    AttendanceCreate, AttendanceUpdate, AttendanceResponse
)
from app.schemas.payroll import (
    PayrollCreate, PayrollUpdate, PayrollResponse
)
from app.schemas.factory_expense import (
    FactoryExpenseCreate, FactoryExpenseUpdate, FactoryExpenseResponse
)
from app.schemas.warehouse import (
    WarehouseCreate, WarehouseUpdate, WarehouseResponse
)
from app.schemas.inventory_transaction import (
    InventoryTransactionCreate, InventoryTransactionUpdate, InventoryTransactionResponse
)
from app.schemas.safety_incident import (
    SafetyIncidentCreate, SafetyIncidentUpdate, SafetyIncidentResponse
)
__all__ = [
    "UserCreate", "LoginRequest", "TokenResponse", "UserResponse",
    "FactoryCreate", "FactoryUpdate", "FactoryResponse", "FactoryWithDepartmentsResponse",
    "DepartmentCreate", "DepartmentUpdate", "DepartmentResponse",
    "WorkerCreate", "WorkerUpdate", "WorkerResponse", "WorkerWithDepartmentResponse",
    "EmploymentStatusEnum", "ShiftTypeEnum",
    "ProductionLineCreate", "ProductionLineUpdate", "ProductionLineResponse", "ProductionLineWithVehiclesResponse",
    "VehicleProductionCreate", "VehicleProductionUpdate", "VehicleProductionResponse",
    "QualityCheckCreate", "QualityCheckUpdate", "QualityCheckResponse",
    "ProductionStats", "ProductionStageEnum", "VehicleTypeEnum",
    "MachineryCreate", "MachineryUpdate", "MachineryResponse", "MachineStatusEnum",
    "RoboticsCreate", "RoboticsUpdate", "RoboticsResponse", "RobotStatusEnum", "AutomationTypeEnum",
    "MaintenanceLogCreate", "MaintenanceLogUpdate", "MaintenanceLogResponse", "MaintenanceTypeEnum",
    "SupplierCreate", "SupplierUpdate", "SupplierResponse",
    "RawMaterialCreate", "RawMaterialUpdate", "RawMaterialResponse", "RawMaterialWithSupplierResponse",
    "AttendanceCreate", "AttendanceUpdate", "AttendanceResponse",
    "PayrollCreate", "PayrollUpdate", "PayrollResponse",
    "FactoryExpenseCreate", "FactoryExpenseUpdate", "FactoryExpenseResponse",
    "WarehouseCreate", "WarehouseUpdate", "WarehouseResponse",
    "InventoryTransactionCreate","InventoryTransactionUpdate", "InventoryTransactionResponse",
    "SafetyIncidentCreate", "SafetyIncidentUpdate", "SafetyIncidentResponse"
]