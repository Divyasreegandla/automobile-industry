import React, { useState, useEffect } from 'react';
import { BellIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { salesService } from '../../services/sales';
import { useAuth } from '../../contexts/AuthContext';

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load read notifications from localStorage on mount
  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const alerts = [];
      const userRole = user?.role;
      
      // Get read status from localStorage
      const savedReadStatus = localStorage.getItem('notification_read_status');
      const readStatus = savedReadStatus ? JSON.parse(savedReadStatus) : {};

      // Get dashboard data
      let dashboardData = {};
      try {
        const dashboardRes = await salesService.getDashboardAnalytics();
        dashboardData = dashboardRes.data || {};
      } catch (err) {
        console.log('Dashboard API not available');
      }

      // Get sales data
      let salesData = [];
      try {
        const salesRes = await salesService.getSales();
        salesData = salesRes.data || [];
      } catch (err) {
        console.log('Sales API not available');
      }

      // Generate notifications based on role
      const notificationList = [];

      // Admin/Manager notifications
      if (userRole === 'admin' || userRole === 'manager') {
        notificationList.push({
          id: 'low_stock_1',
          title: '📦 Low Stock Alert',
          message: '5 raw materials are below minimum stock level',
          type: 'warning',
          time: new Date().toLocaleTimeString(),
          date: new Date().toDateString(),
        });

        const pendingDeliveries = salesData.filter(s => s.sale_status !== 'delivered').length;
        if (pendingDeliveries > 0) {
          notificationList.push({
            id: 'pending_delivery_1',
            title: '🚚 Pending Deliveries',
            message: `${pendingDeliveries} vehicles pending delivery`,
            type: 'info',
            time: new Date().toLocaleTimeString(),
            date: new Date().toDateString(),
          });
        }

        notificationList.push({
          id: 'daily_target_1',
          title: '🎯 Today\'s Target',
          message: 'Daily sales target: 5 vehicles',
          type: 'info',
          time: new Date().toLocaleTimeString(),
          date: new Date().toDateString(),
        });
      }

      // Engineer notifications
      if (userRole === 'engineer') {
        notificationList.push({
          id: 'production_update_1',
          title: '⚙️ Production Update',
          message: 'New production batch started',
          type: 'info',
          time: new Date().toLocaleTimeString(),
          date: new Date().toDateString(),
        });
      }

      // Employee notifications
      if (userRole === 'employee') {
        const currentHour = new Date().getHours();
        if (currentHour < 10) {
          notificationList.push({
            id: 'attendance_reminder_1',
            title: '⏰ Attendance Reminder',
            message: 'Don\'t forget to mark your attendance today',
            type: 'warning',
            time: new Date().toLocaleTimeString(),
            date: new Date().toDateString(),
          });
        }
      }

      // Welcome notification (once per day)
      const today = new Date().toDateString();
      const lastWelcomeDate = localStorage.getItem('last_welcome_date');
      if (lastWelcomeDate !== today) {
        notificationList.push({
          id: `welcome_${today}`,
          title: '👋 Welcome Back!',
          message: `Good to see you, ${user?.full_name?.split(' ')[0] || 'User'}!`,
          type: 'success',
          time: new Date().toLocaleTimeString(),
          date: today,
        });
        localStorage.setItem('last_welcome_date', today);
      }

      // Add read status to each notification
      const notificationsWithReadStatus = notificationList.map(notif => ({
        ...notif,
        read: readStatus[notif.id] || false
      }));

      setNotifications(notificationsWithReadStatus);
      setUnreadCount(notificationsWithReadStatus.filter(n => !n.read).length);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback notification
      setNotifications([{
        id: 'system_ready',
        title: 'System Ready',
        message: 'AutoFactory ERP is running',
        type: 'success',
        time: new Date().toLocaleTimeString(),
        date: new Date().toDateString(),
        read: false
      }]);
      setUnreadCount(1);
    }
  };

  const markAsRead = (id) => {
    // Update local state
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          return { ...n, read: true };
        }
        return n;
      })
    );
    
    // Update localStorage
    const savedReadStatus = localStorage.getItem('notification_read_status');
    const readStatus = savedReadStatus ? JSON.parse(savedReadStatus) : {};
    readStatus[id] = true;
    localStorage.setItem('notification_read_status', JSON.stringify(readStatus));
    
    // Update unread count
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    // Update local state
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
    
    // Update localStorage for all notifications
    const savedReadStatus = localStorage.getItem('notification_read_status');
    const readStatus = savedReadStatus ? JSON.parse(savedReadStatus) : {};
    
    notifications.forEach(notif => {
      readStatus[notif.id] = true;
    });
    localStorage.setItem('notification_read_status', JSON.stringify(readStatus));
    
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
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
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