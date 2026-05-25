import React, { useState, useEffect } from 'react';
import { PlusIcon, WrenchIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { machineryService } from '../services/machinery';
import { LiveCounter } from '../components/Common/LiveCounter';
import { CostTrendChart } from '../components/Charts/ProductionChart';
import toast from 'react-hot-toast';

export const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    machine_id: '',
    maintenance_type: 'preventive',
    maintenance_date: new Date().toISOString().split('T')[0],
    technician_name: '',
    maintenance_cost: 0,
    downtime_hours: 0,
    remarks: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [logsRes, machinesRes] = await Promise.all([
        machineryService.getMaintenanceLogs(),
        machineryService.getMachinery(),
      ]);
      setLogs(logsRes.data);
      setMachines(machinesRes.data);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await machineryService.createMaintenanceLog(formData);
      toast.success('Maintenance log created');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to create log');
    }
  };

  const totalCost = logs.reduce((sum, log) => sum + (log.maintenance_cost || 0), 0);
  const totalDowntime = logs.reduce((sum, log) => sum + (log.downtime_hours || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Maintenance Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track equipment maintenance</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Maintenance Log
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <LiveCounter
          title="Total Maintenance Cost"
          value={totalCost}
          unit="₹"
          icon={CurrencyDollarIcon}
          color="bg-red-500"
        />
        <LiveCounter
          title="Total Downtime"
          value={totalDowntime}
          unit="hrs"
          icon={ClockIcon}
          color="bg-orange-500"
        />
        <LiveCounter
          title="Maintenance Count"
          value={logs.length}
          icon={WrenchIcon}
          color="bg-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Maintenance Cost Trend
          </h2>
          <CostTrendChart />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Recent Maintenance
          </h2>
          <div className="space-y-3">
            {logs.slice(0, 5).map((log) => {
              const machine = machines.find((m) => m.id === log.machine_id);
              return (
                <div
                  key={log.id}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {machine?.machine_name || 'Machine'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {log.maintenance_type} | {log.maintenance_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      ₹{log.maintenance_cost}
                    </p>
                    <p className="text-xs text-gray-500">{log.downtime_hours} hrs downtime</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-white">All Maintenance Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Machine</th>
                <th className="table-header">Type</th>
                <th className="table-header">Technician</th>
                <th className="table-header">Cost</th>
                <th className="table-header">Downtime</th>
                <th className="table-header">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log) => {
                const machine = machines.find((m) => m.id === log.machine_id);
                return (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell">{log.maintenance_date}</td>
                    <td className="table-cell font-medium">{machine?.machine_name || '-'}</td>
                    <td className="table-cell">
                      <span className="status-badge bg-blue-100 text-blue-800">
                        {log.maintenance_type}
                      </span>
                    </td>
                    <td className="table-cell">{log.technician_name}</td>
                    <td className="table-cell">₹{log.maintenance_cost}</td>
                    <td className="table-cell">{log.downtime_hours} hrs</td>
                    <td className="table-cell text-gray-500">{log.remarks}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Maintenance Log</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <select
                  value={formData.machine_id}
                  onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Machine</option>
                  {machines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.machine_name}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.maintenance_type}
                  onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                  className="input-field"
                >
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="emergency">Emergency</option>
                  <option value="calibration">Calibration</option>
                </select>
                <input
                  type="date"
                  value={formData.maintenance_date}
                  onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="Technician Name"
                  value={formData.technician_name}
                  onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="number"
                  placeholder="Maintenance Cost"
                  value={formData.maintenance_cost}
                  onChange={(e) => setFormData({ ...formData, maintenance_cost: parseFloat(e.target.value) })}
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder="Downtime Hours"
                  value={formData.downtime_hours}
                  onChange={(e) => setFormData({ ...formData, downtime_hours: parseFloat(e.target.value) })}
                  className="input-field"
                />
                <textarea
                  placeholder="Remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="input-field"
                  rows="2"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};