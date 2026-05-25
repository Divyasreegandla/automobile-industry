import React, { useState, useEffect } from 'react';
import { BellIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { reportsService } from '../../services/reports';
import { useAuth } from '../../contexts/AuthContext';
import { workerService } from '../../services/worker';

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const alerts = [];

      // Get current user's role
      const userRole = user?.role;
      const userEmail = user?.email;

      // For ALL users - System health notifications
      const healthResponse = await reportsService.getDashboardAnalytics();
      const data = healthResponse.data;

      // Get worker info if user is employee
      let workerInfo = null;
      if (userRole === 'employee' && userEmail) {
        try {
          const workersRes = await workerService.getWorkers();
          workerInfo = workersRes.data?.find(w => w.email === userEmail);
        } catch (err) {
          console.error('Error fetching worker info:', err);
        }
      }

      // ========== ADMIN & MANAGER NOTIFICATIONS ==========
      if (userRole === 'admin' || userRole === 'manager') {
        // Low stock alert
        if (data.low_stock_items > 0) {
          alerts.push({
            id: 1,
            title: '⚠️ Low Stock Alert',
            message: `${data.low_stock_items} raw materials are below minimum stock level`,
            type: 'warning',
            time: new Date().toLocaleTimeString(),
            read: false,
            userSpecific: false
          });
        }

        // Maintenance due
        if (data.pending_maintenance > 0) {
          alerts.push({
            id: 2,
            title: '🔧 Maintenance Due',
            message: `${data.pending_maintenance} machines require immediate maintenance`,
            type: 'warning',
            time: new Date().toLocaleTimeString(),
            read: false,
            userSpecific: false
          });
        }

        // Quality alert
        if (data.quality_fail_rate && data.quality_fail_rate > 10) {
          alerts.push({
            id: 3,
            title: '📊 Quality Alert',
            message: `Quality fail rate is ${data.quality_fail_rate}%, above threshold`,
            type: 'error',
            time: new Date().toLocaleTimeString(),
            read: false,
            userSpecific: false
          });
        }

        // Pending payroll
        if (data.pending_payroll > 0) {
          alerts.push({
            id: 4,
            title: '💰 Payroll Pending',
            message: `${data.pending_payroll} payroll records are pending approval`,
            type: 'info',
            time: new Date().toLocaleTimeString(),
            read: false,
            userSpecific: false
          });
        }
      }

      // ========== SUPERVISOR NOTIFICATIONS ==========
      if (userRole === 'supervisor') {
        // Production status
        if (data.today_production < data.target_production) {
          alerts.push({
            id: 5,
            title: '🏭 Production Alert',
            message: `Today's production (${data.today_production || 0}) is below target`,
            type: 'warning',
            time: new Date().toLocaleTimeString(),
            read: false,
            userSpecific: false
          });
        }

        // Quality alerts for supervisor
        if (data.quality_fail_rate && data.quality_fail_rate > 15) {
          alerts.push({
            id: 6,
            title: '🔍 Quality Issue',
            message: `High failure rate (${data.quality_fail_rate}%) detected in quality checks`,
            type: 'error',
            time: new Date().toLocaleTimeString(),
            read: false,
            userSpecific: false
          });
        }
      }

      // ========== ENGINEER NOTIFICATIONS ==========
      if (userRole === 'engineer') {
        // Machine maintenance
        if (data.machines_due_maintenance > 0) {
          alerts.push({
            id: 7,
            title: '⚙️ Machine Maintenance',
            message: `${data.machines_due_maintenance || 0} machines need maintenance this week`,
            type: 'info',
            time: new Date().toLocaleTimeString(),
            read: false,
            userSpecific: false
          });
        }

        // Robot calibration
        if (data.robots_due_calibration > 0) {
          alerts.push({
            id: 8,
            title: '🤖 Robot Calibration',
            message: `${data.robots_due_calibration || 0} robots require calibration`,
            type: 'info',
            time: new Date().toLocaleTimeString(),
            read: false,
            userSpecific: false
          });
        }
      }

      // ========== EMPLOYEE-SPECIFIC NOTIFICATIONS ==========
      if (userRole === 'employee' && workerInfo) {
        // Today's attendance reminder
        const today = new Date().toISOString().split('T')[0];
        const attendanceRes = await workerService.getAttendance({
          worker_id: workerInfo.id,
          attendance_date: today
        });
        const todayAttendance = attendanceRes.data?.[0];

        if (!todayAttendance?.check_in) {
          alerts.push({
            id: 10,
            title: '⏰ Check-in Reminder',
            message: 'You haven\'t checked in today. Please check in to start your shift.',
            type: 'warning',
            time: new Date().toLocaleTimeString(),
            read: false,
            userSpecific: true
          });
        } else if (todayAttendance?.check_in && !todayAttendance?.check_out) {
          alerts.push({
            id: 11,
            title: '⌛ Check-out Reminder',
            message: 'You have checked in but not checked out. Don\'t forget to check out.',
            type: 'info',
            time: new Date().toLocaleTimeString(),
            read: false,
            userSpecific: true
          });
        }

        // Welcome back message (once per day)
        const lastLogin = localStorage.getItem('last_login_date');
        const todayStr = new Date().toISOString().split('T')[0];
        if (lastLogin !== todayStr) {
          alerts.push({
            id: 12,
            title: '👋 Welcome Back!',
            message: `Good to see you, ${workerInfo.full_name?.split(' ')[0]}! Have a productive day.`,
            type: 'success',
            time: new Date().toLocaleTimeString(),
            read: false,
            userSpecific: true
          });
          localStorage.setItem('last_login_date', todayStr);
        }

        // Salary/payroll notification
        const currentMonth = new Date().getMonth();
        const payrollRes = await fetch(`http://localhost:8000/api/v1/payroll/?worker_id=${workerInfo.id}`);
        const payrollData = await payrollRes.json();
        const hasCurrentMonthPayroll = payrollData.some(p => new Date(p.created_at).getMonth() === currentMonth);
        
        if (!hasCurrentMonthPayroll && new Date().getDate() > 25) {
          alerts.push({
            id: 13,
            title: '💰 Salary Update',
            message: 'This month\'s salary will be processed soon.',
            type: 'info',
            time: new Date().toLocaleTimeString(),
            read: false,
            userSpecific: true
          });
        }
      }

      // ========== COMMON NOTIFICATIONS FOR ALL ==========
      // Greeting based on time of day
      const hour = new Date().getHours();
      let greeting = '';
      if (hour < 12) greeting = 'Good morning!';
      else if (hour < 18) greeting = 'Good afternoon!';
      else greeting = 'Good evening!';

      // Only add greeting if no other important alerts
      if (alerts.length === 0) {
        alerts.push({
          id: 99,
          title: greeting,
          message: `Welcome to AutoFactory ERP, ${user?.full_name?.split(' ')[0] || 'User'}!`,
          type: 'success',
          time: new Date().toLocaleTimeString(),
          read: false,
          userSpecific: true
        });
      }

      // Sort notifications by type priority
      const priorityOrder = { error: 0, warning: 1, info: 2, success: 3 };
      alerts.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

      setNotifications(alerts);
      setUnreadCount(alerts.filter((n) => !n.read).length);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700 transition"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-gray-500">({unreadCount} unread)</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <BellIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No new notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t dark:border-gray-700 text-center">
            <button 
              onClick={() => setShowDropdown(false)}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};