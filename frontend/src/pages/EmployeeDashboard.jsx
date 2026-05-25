import React, { useState, useEffect } from 'react';
import { 
  UserCircleIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { workerService } from '../services/worker';
import { payrollService } from '../services/payroll';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchEmployeeData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const workersRes = await workerService.getWorkers();
      const currentEmployee = workersRes.data?.find(w => w.email === user?.email);
      
      if (currentEmployee) {
        setEmployee(currentEmployee);
        
        const attendanceRes = await workerService.getAttendance({ worker_id: currentEmployee.id });
        setAttendance(attendanceRes.data || []);
        
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = attendanceRes.data?.find(a => a.attendance_date === today);
        setTodayAttendance(todayRecord);
        
        const payrollRes = await payrollService.getPayroll({ worker_id: currentEmployee.id });
        setPayroll(payrollRes.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!employee) return;
    try {
      const currentTimeStr = checkInTime || new Date().toLocaleTimeString();
      await workerService.createAttendance({
        worker_id: employee.id,
        attendance_date: new Date().toISOString().split('T')[0],
        check_in: currentTimeStr,
        status: 'present'
      });
      toast.success('Check-in recorded!');
      setShowCheckInModal(false);
      fetchEmployeeData();
    } catch (error) {
      toast.error('Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;
    try {
      const currentTimeStr = checkOutTime || new Date().toLocaleTimeString();
      await workerService.updateAttendance(todayAttendance.id, { check_out: currentTimeStr });
      toast.success('Check-out recorded!');
      setShowCheckOutModal(false);
      fetchEmployeeData();
    } catch (error) {
      toast.error('Check-out failed');
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-xl font-semibold">No Employee Record Found</h2>
          <p className="text-gray-600 mt-2">Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-gray-600">View your attendance and payroll</p>
        </div>
        <button onClick={fetchEmployeeData} className="btn-secondary">
          <ArrowPathIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {employee?.full_name?.split(' ')[0]}!</h1>
            <p className="text-blue-100 mt-1">{employee?.designation}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <BuildingOfficeIcon className="h-5 w-5 text-blue-200" />
                <span className="text-sm">ID: {employee?.employee_code}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-blue-200" />
                <span className="text-sm">{currentTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-200">Today's Status</p>
            {!todayAttendance?.check_in ? (
              <button onClick={() => setShowCheckInModal(true)} className="mt-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg">
                Check In
              </button>
            ) : !todayAttendance?.check_out ? (
              <button onClick={() => setShowCheckOutModal(true)} className="mt-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg">
                Check Out
              </button>
            ) : (
              <div className="mt-2 flex items-center gap-2 bg-green-600 px-4 py-2 rounded-lg">
                <CheckCircleIcon className="h-5 w-5" />
                <span>Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Employee Code</p>
          <p className="text-xl font-bold mt-1">{employee?.employee_code}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Designation</p>
          <p className="text-xl font-bold mt-1">{employee?.designation}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Basic Salary</p>
          <p className="text-xl font-bold mt-1">₹{employee?.basic_salary?.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm">Shift Type</p>
          <p className="text-xl font-bold mt-1 capitalize">{employee?.shift_type}</p>
        </div>
      </div>

      {/* Today's Attendance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Today's Attendance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-500 text-sm">Check In Time</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {todayAttendance?.check_in ? formatTime(todayAttendance.check_in) : 'Not Checked In'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-500 text-sm">Check Out Time</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {todayAttendance?.check_out ? formatTime(todayAttendance.check_out) : 'Not Checked Out'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-500 text-sm">Overtime Hours</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {todayAttendance?.overtime_hours || 0} hrs
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <UserCircleIcon className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600 w-32">Full Name:</span>
            <span className="font-medium">{employee?.full_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600 w-32">Email:</span>
            <span className="font-medium">{employee?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <PhoneIcon className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600 w-32">Phone:</span>
            <span className="font-medium">{employee?.phone || 'Not provided'}</span>
          </div>
          <div className="flex items-center gap-3">
            <BriefcaseIcon className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600 w-32">Designation:</span>
            <span className="font-medium">{employee?.designation}</span>
          </div>
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600 w-32">Joining Date:</span>
            <span className="font-medium">{employee?.joining_date}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600 w-32">Address:</span>
            <span className="font-medium">{employee?.address || 'Not provided'}</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Check In</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCheckIn(); }}>
              <input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className="input-field mb-4" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowCheckInModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCheckOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Check Out</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCheckOut(); }}>
              <input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className="input-field mb-4" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowCheckOutModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};