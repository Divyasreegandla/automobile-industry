import React, { useState, useEffect, useCallback } from 'react';
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { workerService } from '../services/worker';
import toast from 'react-hot-toast';

export const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [attendanceRes, workersRes] = await Promise.all([
        workerService.getAttendance({ attendance_date: selectedDate }),
        workerService.getWorkers(),
      ]);
      setAttendance(attendanceRes.data);
      setWorkers(workersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCheckIn = async (workerId) => {
    try {
      const currentTime = new Date().toLocaleTimeString();
      await workerService.createAttendance({
        worker_id: workerId,
        attendance_date: selectedDate,
        check_in: currentTime,
        status: 'present',
      });
      toast.success('Check-in recorded');
      fetchData();
    } catch (error) {
      toast.error('Check-in failed');
    }
  };

  const handleCheckOut = async (workerId) => {
    try {
      const attendanceRecord = attendance.find((a) => a.worker_id === workerId);
      if (!attendanceRecord) {
        toast.error('No check-in record found');
        return;
      }
      const currentTime = new Date().toLocaleTimeString();
      await workerService.updateAttendance(attendanceRecord.id, {
        check_out: currentTime,
      });
      toast.success('Check-out recorded');
      fetchData();
    } catch (error) {
      toast.error('Check-out failed');
    }
  };

  const getAttendanceStatus = (workerId) => {
    const record = attendance.find((a) => a.worker_id === workerId);
    if (!record) return 'absent';
    if (record.check_in && !record.check_out) return 'present';
    if (record.check_in && record.check_out) return 'completed';
    return 'absent';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance Tracking</h1>
        <p className="text-gray-600 dark:text-gray-400">Mark daily attendance for workers</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <CalendarIcon className="h-6 w-6 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field w-auto"
          />
          <button onClick={fetchData} className="btn-primary">
            Load Attendance
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="table-header">Employee Code</th>
                <th className="table-header">Name</th>
                <th className="table-header">Designation</th>
                <th className="table-header">Status</th>
                <th className="table-header">Check In</th>
                <th className="table-header">Check Out</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {workers.map((worker) => {
                const record = attendance.find((a) => a.worker_id === worker.id);
                const status = getAttendanceStatus(worker.id);
                return (
                  <tr key={worker.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell font-mono text-sm">{worker.employee_code}</td>
                    <td className="table-cell font-medium">{worker.full_name}</td>
                    <td className="table-cell">{worker.designation}</td>
                    <td className="table-cell">
                      {status === 'present' && (
                        <span className="status-badge bg-blue-100 text-blue-800">
                          <ClockIcon className="h-3 w-3 inline mr-1" />
                          In Progress
                        </span>
                      )}
                      {status === 'completed' && (
                        <span className="status-badge bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-3 w-3 inline mr-1" />
                          Completed
                        </span>
                      )}
                      {status === 'absent' && (
                        <span className="status-badge bg-red-100 text-red-800">
                          <XCircleIcon className="h-3 w-3 inline mr-1" />
                          Absent
                        </span>
                      )}
                    </td>
                    <td className="table-cell">{record?.check_in || '--:--'}</td>
                    <td className="table-cell">{record?.check_out || '--:--'}</td>
                    <td className="table-cell">
                      {!record?.check_in ? (
                        <button
                          onClick={() => handleCheckIn(worker.id)}
                          className="btn-primary text-sm py-1 px-3"
                        >
                          Check In
                        </button>
                      ) : !record?.check_out ? (
                        <button
                          onClick={() => handleCheckOut(worker.id)}
                          className="btn-secondary text-sm py-1 px-3"
                        >
                          Check Out
                        </button>
                      ) : (
                        <span className="text-green-600 text-sm">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};