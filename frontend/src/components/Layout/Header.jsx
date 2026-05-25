import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export const Header = () => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const notifications = [
    { id: 1, title: 'Low Stock Alert', message: '5 items below minimum stock', time: '5 min ago', read: false },
    { id: 2, title: 'Maintenance Due', message: 'Machine PRESS-001 needs service', time: '1 hour ago', read: false },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Search Bar - Desktop */}
        <div className="hidden md:block flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workers, machines, production..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Search Button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300"
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border dark:border-gray-700">
                <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Notifications ({unreadCount})
                  </h3>
                  <button className="text-xs text-blue-600 hover:text-blue-700">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          !notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300"
          >
            {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <UserCircleIcon className="h-8 w-8 text-gray-500" />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role || 'role'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 input-field"
                autoFocus
              />
              <button onClick={() => setShowSearch(false)} className="ml-2 p-2">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};