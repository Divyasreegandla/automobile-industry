import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import {
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  BriefcaseIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    phone: '',
    designation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await login({ email: formData.email, password: formData.password });
        
        // Redirect based on role
        if (formData.role === 'employee') {
          navigate('/employee-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrors({ submit: data.detail || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Full system access' },
    { value: 'manager', label: 'Manager', description: 'Factory operations' },
    { value: 'supervisor', label: 'Supervisor', description: 'Production floor' },
    { value: 'employee', label: 'Employee', description: 'View own data' },
    { value: 'engineer', label: 'Engineer', description: 'Technical access' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center py-12 px-4">
      <Toaster position="top-right" />
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <Link to="/login" className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6 transition">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Login
        </Link>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-3 shadow-lg">
            <BuildingOfficeIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Register for AutoFactory ERP System
          </p>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={`input-field pl-9 ${errors.full_name ? 'border-red-500' : ''}`}
                placeholder="Enter your full name"
              />
              <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
          </div>

          <div className="mb-3">
            <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`input-field pl-9 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter your email"
              />
              <EnvelopeIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="mb-3">
            <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field pl-9"
                placeholder="Enter your phone number"
              />
              <PhoneIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium">
              Designation (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="input-field pl-9"
                placeholder="e.g., Software Engineer"
              />
              <BriefcaseIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-field"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label} - {role.description}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`input-field pl-9 pr-9 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Create a password"
              />
              <LockClosedIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5"
              >
                {showPassword ? <EyeSlashIcon className="h-4 w-4 text-gray-400" /> : <EyeIcon className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`input-field pl-9 pr-9 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Confirm your password"
              />
              <LockClosedIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5"
              >
                {showConfirmPassword ? <EyeSlashIcon className="h-4 w-4 text-gray-400" /> : <EyeIcon className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};