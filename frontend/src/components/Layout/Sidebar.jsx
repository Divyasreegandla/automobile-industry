import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HomeIcon, 
  UsersIcon, 
  CalendarIcon, 
  CogIcon, 
  WrenchScrewdriverIcon, 
  CubeIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ShieldCheckIcon, 
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CpuChipIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define menu items based on role
  const getMenuItems = () => {
    const role = user?.role;
    
    // EMPLOYEE - Only sees Employee Dashboard
    if (role === 'employee') {
      return [
        { path: '/employee-dashboard', name: 'My Dashboard', icon: HomeIcon },
      ];
    }
    
    // ADMIN - Full access to everything
    if (role === 'admin') {
      return [
        { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
        { path: '/workers', name: 'Workers', icon: UsersIcon },
        { path: '/admin-attendance', name: 'Attendance', icon: CalendarIcon },
        { path: '/production', name: 'Production', icon: CogIcon },
        { path: '/machinery', name: 'Machinery', icon: CogIcon },
        { path: '/robotics', name: 'Robotics', icon: CpuChipIcon },
        { path: '/maintenance', name: 'Maintenance', icon: WrenchScrewdriverIcon },
        { path: '/inventory', name: 'Inventory', icon: CubeIcon },
        { path: '/warehouse', name: 'Warehouse', icon: BuildingOfficeIcon },
        { path: '/payroll', name: 'Payroll', icon: CurrencyDollarIcon },
        { path: '/cost-analysis', name: 'Cost Analysis', icon: ChartBarIcon },
        { path: '/reports', name: 'Reports', icon: DocumentTextIcon },
        { path: '/safety', name: 'Safety', icon: ShieldCheckIcon },
      ];
    }
    
    // MANAGER - Similar to admin but with some restrictions (no delete)
    if (role === 'manager') {
      return [
        { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
        { path: '/workers', name: 'Workers', icon: UsersIcon },
        { path: '/admin-attendance', name: 'Attendance', icon: CalendarIcon },
        { path: '/production', name: 'Production', icon: CogIcon },
        { path: '/machinery', name: 'Machinery', icon: CogIcon },
        { path: '/robotics', name: 'Robotics', icon: CpuChipIcon },
        { path: '/maintenance', name: 'Maintenance', icon: WrenchScrewdriverIcon },
        { path: '/inventory', name: 'Inventory', icon: CubeIcon },
        { path: '/warehouse', name: 'Warehouse', icon: BuildingOfficeIcon },
        { path: '/payroll', name: 'Payroll', icon: CurrencyDollarIcon },
        { path: '/cost-analysis', name: 'Cost Analysis', icon: ChartBarIcon },
        { path: '/reports', name: 'Reports', icon: DocumentTextIcon },
        { path: '/safety', name: 'Safety', icon: ShieldCheckIcon },
      ];
    }
    
    // SUPERVISOR - Limited access (production, attendance, quality)
    if (role === 'supervisor') {
      return [
        { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
        { path: '/admin-attendance', name: 'Attendance', icon: CalendarIcon },
        { path: '/production', name: 'Production', icon: CogIcon },
        { path: '/quality', name: 'Quality Control', icon: CheckCircleIcon },
        { path: '/reports', name: 'Reports', icon: DocumentTextIcon },
      ];
    }
    
    // ENGINEER - Technical modules (machinery, maintenance, robotics)
    if (role === 'engineer') {
      return [
        { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
        { path: '/machinery', name: 'Machinery', icon: CogIcon },
        { path: '/robotics', name: 'Robotics', icon: CpuChipIcon },
        { path: '/maintenance', name: 'Maintenance', icon: WrenchScrewdriverIcon },
        { path: '/production', name: 'Production', icon: CogIcon },
        { path: '/reports', name: 'Reports', icon: DocumentTextIcon },
      ];
    }
    
    // Default fallback
    return [
      { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-gray-900 text-white flex flex-col transition-all duration-300 relative`}>
      {/* Logo Section */}
      <div className={`p-4 border-b border-gray-800 ${collapsed ? 'text-center' : ''}`}>
        {!collapsed ? (
          <>
            <h1 className="text-xl font-bold">AutoFactory ERP</h1>
            <p className="text-sm text-gray-400">
              {user?.role === 'employee' ? 'Employee Portal' : 
               user?.role === 'supervisor' ? 'Supervisor Portal' :
               user?.role === 'engineer' ? 'Engineering Portal' :
               user?.role === 'manager' ? 'Manager Portal' : 'Admin Portal'}
            </p>
          </>
        ) : (
          <h1 className="text-2xl font-bold">AE</h1>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-gray-800 p-1 rounded-full hover:bg-gray-700 transition-all z-10"
      >
        {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
      </button>

      {/* Navigation Menu */}
      <nav className="flex-1 mt-6 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 transition duration-200 ${
                isActive ? 'bg-gray-800 text-white border-r-4 border-blue-500' : ''
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.name : ''}
          >
            <item.icon className="h-5 w-5 min-w-[20px]" />
            {!collapsed && <span className="ml-3 whitespace-nowrap">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        {!collapsed ? (
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-2">
              <UserCircleIcon className="h-6 w-6 text-gray-400" />
              <div>
                <p className="text-white font-medium truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role || 'role'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 flex items-center text-red-400 hover:text-red-300 text-sm w-full"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex justify-center text-red-400 hover:text-red-300 w-full"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  );
};