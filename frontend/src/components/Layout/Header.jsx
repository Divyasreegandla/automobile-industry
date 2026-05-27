import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BellIcon, MoonIcon, SunIcon, UserCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { NotificationBell } from '../Common/NotificationBell';

export const Header = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workers, machines, production..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Search Button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-500" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <UserCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
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
              <button onClick={() => setShowSearch(false)} className="ml-2 p-2 text-gray-500 dark:text-gray-400">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};