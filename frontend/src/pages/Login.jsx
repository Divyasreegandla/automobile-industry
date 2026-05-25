import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import {
  BuildingOfficeIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      
      // Get user role from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      // Redirect based on role
      if (user?.role === 'employee') {
        navigate('/employee-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Error handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { 
      role: 'Admin', 
      email: 'admin@factory.com', 
      password: 'string', 
      icon: ShieldCheckIcon, 
      color: 'bg-purple-500',
      description: 'Full system access'
    },
    { 
      role: 'Manager', 
      email: 'manager@factory.com', 
      password: 'string', 
      icon: UserGroupIcon, 
      color: 'bg-blue-500',
      description: 'Factory operations'
    },
    { 
      role: 'Supervisor', 
      email: 'supervisor@factory.com', 
      password: 'string', 
      icon: Cog6ToothIcon, 
      color: 'bg-green-500',
      description: 'Production floor'
    },
    { 
      role: 'Employee', 
      email: 'employee@factory.com', 
      password: 'string', 
      icon: UserIcon, 
      color: 'bg-orange-500',
      description: 'View own data'
    },
    { 
      role: 'Engineer', 
      email: 'engineer@factory.com', 
      password: 'string', 
      icon: ComputerDesktopIcon, 
      color: 'bg-teal-500',
      description: 'Technical access'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <Toaster position="top-right" />
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <BuildingOfficeIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            AutoFactory ERP
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Automobile Industry Management System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="Enter your email"
                required
              />
              <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-10"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <p className="text-center text-sm text-gray-500 mb-4">Demo Credentials</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {demoCredentials.map((cred) => (
              <button
                key={cred.role}
                onClick={() => {
                  setEmail(cred.email);
                  setPassword(cred.password);
                }}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
              >
                <div className={`${cred.color} p-3 rounded-full mb-2 group-hover:scale-110 transition-transform`}>
                  <cred.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {cred.role}
                </span>
                <span className="text-xs text-gray-400 mt-1">{cred.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>AutoFactory ERP v1.0 | Enterprise Production Management System</p>
        </div>
      </div>
    </div>
  );
};