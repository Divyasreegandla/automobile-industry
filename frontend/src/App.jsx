import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { Workers } from './pages/Workers';
import { Attendance } from './pages/Attendance';
import { Production } from './pages/Production';
import { Machinery } from './pages/Machinery';
import { Maintenance } from './pages/Maintenance';
import { Inventory } from './pages/Inventory';
import { Payroll } from './pages/Payroll';
import { CostAnalysis } from './pages/CostAnalysis';
import { Reports } from './pages/Reports';
import { Safety } from './pages/Safety';
import { AdminAttendance } from './pages/AdminAttendance';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Dashboard - for admin, manager, supervisor, engineer */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'supervisor', 'engineer']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Employee Dashboard - only for employee role */}
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Other Admin Pages - accessible only by admin/manager/supervisor/engineer */}
          <Route
            path="/workers"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Workers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'supervisor']}>
                <Attendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/production"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'supervisor', 'engineer']}>
                <Production />
              </ProtectedRoute>
            }
          />

          <Route
            path="/machinery"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'engineer']}>
                <Machinery />
              </ProtectedRoute>
            }
          />

          <Route
            path="/robotics"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'engineer']}>
                <Machinery />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'engineer']}>
                <Maintenance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Inventory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Inventory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payroll"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Payroll />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cost-analysis"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'supervisor']}>
                <CostAnalysis />
              </ProtectedRoute>
            }
          />
<Route 
  path="/admin-attendance" 
  element={
    <ProtectedRoute allowedRoles={['admin', 'manager', 'supervisor']}>
      <AdminAttendance />
    </ProtectedRoute>
  } 
/>
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'supervisor']}>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/safety"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Safety />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;