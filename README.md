# Automobile Industry ERP System

## Overview
Enterprise-level Automobile Factory Management System built with FastAPI and PostgreSQL. Complete solution for production management and vehicle sales tracking.

## Features

### Core ERP Features
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

### Sales Module Features (NEW)
- ✅ Showroom Management
- ✅ Dealer Management
- ✅ Vehicle Sales Tracking
- ✅ Customer Booking System
- ✅ Delivery Management
- ✅ Sales Analytics Dashboard
- ✅ Revenue & Profit Tracking
- ✅ State-wise Sales Monitoring
- ✅ Regional Performance Reports
- ✅ Sales Target & Achievement System
- ✅ Real-time sales monitoring
- ✅ Interactive charts and dashboards
- ✅ India map sales visualization

## Technology Stack

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL, pgAdmin
- **ORM:** SQLAlchemy
- **Authentication:** JWT with bcrypt
- **API Documentation:** Swagger UI (Auto-generated)

### Frontend
- **Framework:** React 18
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Icons:** Heroicons

## API Endpoints
100+ REST API endpoints covering all factory operations and sales management.

### Sales Module Endpoints
| Category | Endpoints |
|----------|-----------|
| Showrooms | POST, GET, PUT, DELETE |
| Dealers | POST, GET, PUT, DELETE |
| Vehicle Models | POST, GET, PUT, DELETE |
| Customers | POST, GET, PUT, DELETE |
| Bookings | POST, GET, PUT, DELETE |
| Sales | POST, GET, PUT, DELETE, monthly-report, profit-analysis |
| Delivery | POST, GET, PUT, DELETE, status, tracking |
| Targets | POST, GET, PUT, DELETE, performance |
| Analytics | dashboard, state-wise, city-wise, top-showrooms, top-dealers, top-models |

## Database Tables

### Core Tables (18 tables)
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

### Sales Module Tables (9 new tables)
- showrooms - Showroom/branch management
- dealers - Dealer and distributor management
- vehicle_models - Vehicle catalog with variants
- customers - Customer information
- vehicle_bookings - Booking records
- vehicle_sales - Sales transactions with profit tracking
- sales_targets - Monthly sales targets
- delivery_tracking - Vehicle delivery status
- regional_sales_reports - State-wise sales analytics

**Total Tables: 27**

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- pgAdmin (optional)

### Backend Installation

# Create virtual environment
python -m venv venv

# Activate virtual environment

venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create database in pgAdmin
# Run: CREATE DATABASE automobile_industry;

# Start backend server
uvicorn app.main:app --reload --port 8000

### Frontend Installation
bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start frontend server
npm start

### Access the Application:

Frontend: http://localhost:3000

Backend API: http://localhost:8000


