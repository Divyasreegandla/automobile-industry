import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { workerService } from '../services/worker';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const AdminAttendance = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchWorkers();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedWorker) {
      fetchAttendance();
    }
  }, [selectedWorker, selectedDate]);

  const fetchWorkers = async () => {
    try {
      const response = await workerService.getWorkers();
      setWorkers(response.data || []);
      if (response.data?.length > 0) {
        setSelectedWorker(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedWorker) return;
    try {
      const response = await workerService.getAttendance({ 
        worker_id: selectedWorker.id
      });
      setAttendance(response.data || []);
      
      // Check today's attendance
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = response.data?.find(a => a.attendance_date === today);
      setTodayAttendance(todayRecord);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedWorker) {
      toast.error('No worker selected');
      return;
    }
    
    try {
      const currentTimeStr = checkInTime || new Date().toLocaleTimeString();
      await workerService.createAttendance({
        worker_id: selectedWorker.id,
        attendance_date: new Date().toISOString().split('T')[0],
        check_in: currentTimeStr,
        status: 'present'
      });
      toast.success(`Check-in recorded for ${selectedWorker.full_name}`);
      setShowCheckInModal(false);
      setCheckInTime('');
      fetchAttendance();
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error(error.response?.data?.detail || 'Failed to record check-in');
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) {
      toast.error('No check-in record found');
      return;
    }
    
    try {
      const currentTimeStr = checkOutTime || new Date().toLocaleTimeString();
      await workerService.updateAttendance(todayAttendance.id, {
        check_out: currentTimeStr
      });
      toast.success(`Check-out recorded for ${selectedWorker.full_name}`);
      setShowCheckOutModal(false);
      setCheckOutTime('');
      fetchAttendance();
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error('Failed to record check-out');
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString;
  };

  const getAttendanceStatusForDate = (date) => {
    const record = attendance.find(a => a.attendance_date === date);
    if (!record) return 'absent';
    if (record.check_in && !record.check_out) return 'in_progress';
    if (record.check_in && record.check_out) return 'completed';
    return 'absent';
  };

  const filteredWorkers = workers.filter(worker =>
    worker.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Mark attendance for all workers</p>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">{currentTime.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <CalendarIcon className="h-6 w-6 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field w-auto"
          />
          <button onClick={fetchAttendance} className="btn-primary">
            Load Attendance
          </button>
        </div>
      </div>

      {/* Worker Search and Select */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center gap-4 mb-4">
          <UserGroupIcon className="h-6 w-6 text-gray-500" />
          <h3 className="font-semibold">Select Worker</h3>
        </div>
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search workers by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {filteredWorkers.map((worker) => (
            <button
              key={worker.id}
              onClick={() => setSelectedWorker(worker)}
              className={`p-3 rounded-lg text-left transition ${
                selectedWorker?.id === worker.id
                  ? 'bg-blue-100 border-blue-500 border'
                  : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <p className="font-medium text-sm">{worker.full_name}</p>
              <p className="text-xs text-gray-500">{worker.employee_code}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Worker Details and Attendance */}
      {selectedWorker && (
        <>
          {/* Worker Info */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedWorker.full_name}</h2>
                <p className="text-blue-100 mt-1">{selectedWorker.designation}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Employee Code: {selectedWorker.employee_code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Department: {selectedWorker.department_name || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-200">Today's Status</p>
                {!todayAttendance?.check_in ? (
                  <button
                    onClick={() => setShowCheckInModal(true)}
                    className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Check In
                  </button>
                ) : !todayAttendance?.check_out ? (
                  <button
                    onClick={() => setShowCheckOutModal(true)}
                    className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
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

          {/* Today's Attendance Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Attendance</h3>
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

          {/* Attendance History Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Attendance History - {selectedDate}</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overtime</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendance.filter(a => a.attendance_date === selectedDate).map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{record.attendance_date}</td>
                      <td className="px-4 py-3 text-sm">{formatTime(record.check_in)}</td>
                      <td className="px-4 py-3 text-sm">{formatTime(record.check_out)}</td>
                      <td className="px-4 py-3 text-sm">{record.overtime_hours || 0} hrs</td>
                      <td className="px-4 py-3">
                        {record.check_in && !record.check_out ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">In Progress</span>
                        ) : record.check_in && record.check_out ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Absent</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {attendance.filter(a => a.attendance_date === selectedDate).length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
                        No attendance record for {selectedDate}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Check In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Check In - {selectedWorker?.full_name}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCheckIn(); }}>
              <div className="space-y-3">
                <div>
                  <label className="label">Check In Time</label>
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to use current time</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowCheckInModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check Out Modal */}
      {showCheckOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Check Out - {selectedWorker?.full_name}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCheckOut(); }}>
              <div className="space-y-3">
                <div>
                  <label className="label">Check Out Time</label>
                  <input
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to use current time</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowCheckOutModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Check Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};