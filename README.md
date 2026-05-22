# Automobile Industry ERP System

## Overview
Enterprise-level Automobile Factory Management System built with FastAPI and PostgreSQL.

## Features
- ✅ Authentication & Role Management (JWT)
- ✅ Factory & Department Management
- ✅ Employee & Worker Management
- ✅ Production Line Management
- ✅ Robotics & Machinery Management
- ✅ Maintenance Management
- ✅ Inventory & Raw Material Management
- ✅ Vehicle Production Tracking
- ✅ Shift & Attendance Management
- ✅ Payroll & Salary Management
- ✅ Cost & Expense Tracking
- ✅ Quality Control System
- ✅ Warehouse Management
- ✅ Supplier & Purchase Management
- ✅ Reports & Analytics Dashboard
- ✅ Safety Incident Management
- ✅ IoT/Factory Monitoring Support
- ✅ AI Production Prediction

## Technology Stack
- **Backend:** FastAPI
- **Database:** PostgreSQL, pgAdmin
- **ORM:** SQLAlchemy
- **Authentication:** JWT with bcrypt
- **API Documentation:** Swagger UI (Auto-generated)

## API Endpoints
80+ REST API endpoints covering all factory operations.

## Setup Instructions

### Prerequisites
- Python 3.11+
- PostgreSQL
- pgAdmin

### Installation

1. Clone the repository
2. Create virtual environment:
   python -m venv venv

3. Activate virtual environment:
   - Windows: env\Scripts\activate
   - Mac/Linux: source venv/bin/activate

4. Install dependencies:
   pip install -r requirements.txt

5. Configure database in .env file

6. Run the application:
   uvicorn app.main:app --reload --port 8000

7. Access API documentation:
   Swagger UI: http://localhost:8000/docs
   ReDoc: http://localhost:8000/redoc

## Database Tables
- users (Authentication)
- factories, departments
- workers, attendance
- production_lines, vehicle_production
- machinery, robotics, maintenance_logs
- raw_materials, suppliers
- quality_checks
- payroll, factory_expenses
- warehouse, inventory_transactions
- safety_incidents

## Role-Based Access
- **Admin:** Full system access
- **Manager:** Factory operations
- **Supervisor:** Production supervision
- **Employee:** Basic access
- **Engineer:** Technical access

## Author
Automobile Industry ERP System

## License
Proprietary