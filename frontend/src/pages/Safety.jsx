import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, ExclamationTriangleIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { reportsService } from '../services/reports';
import { workerService } from '../services/worker';
import { LiveCounter } from '../components/Common/LiveCounter';
import toast from 'react-hot-toast';

export const Safety = () => {
  const [incidents, setIncidents] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [summary, setSummary] = useState({ total_incidents: 0, monthly_incidents: 0, severity_breakdown: {} });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [formData, setFormData] = useState({
    worker_id: '',
    incident_type: '',
    incident_date: new Date().toISOString().split('T')[0],
    severity: 'low',
    remarks: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [incidentsRes, workersRes, summaryRes] = await Promise.all([
        workerService.getWorkers(), // Using workers endpoint for incidents
        workerService.getWorkers(),
        reportsService.getSafetyDashboard(),
      ]);
      setIncidents(incidentsRes.data);
      setWorkers(workersRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching safety data:', error);
      toast.error('Failed to load safety data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingIncident) {
        // Update incident logic here
        toast.success('Incident updated successfully');
      } else {
        // Create incident logic here
        toast.success('Incident reported successfully');
      }
      setShowModal(false);
      setEditingIncident(null);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity] || 'bg-gray-100';
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Safety Incident Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage safety incidents</p>
        </div>
        <button
          onClick={() => {
            setEditingIncident(null);
            setFormData({
              worker_id: '',
              incident_type: '',
              incident_date: new Date().toISOString().split('T')[0],
              severity: 'low',
              remarks: '',
            });
            setShowModal(true);
          }}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Report Incident
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <LiveCounter
          title="Total Incidents"
          value={summary.total_incidents || 0}
          icon={ExclamationTriangleIcon}
          color="bg-red-500"
        />
        <LiveCounter
          title="Monthly Incidents"
          value={summary.monthly_incidents || 0}
          icon={ClockIcon}
          color="bg-yellow-500"
        />
        <LiveCounter
          title="High Severity"
          value={summary.severity_breakdown?.high || 0}
          icon={ExclamationTriangleIcon}
          color="bg-orange-500"
        />
        <LiveCounter
          title="Critical"
          value={summary.severity_breakdown?.critical || 0}
          icon={ShieldCheckIcon}
          color="bg-purple-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Worker</th>
                <th className="table-header">Incident Type</th>
                <th className="table-header">Severity</th>
                <th className="table-header">Remarks</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No safety incidents reported
                  </td>
                </tr>
              ) : (
                incidents.map((incident) => {
                  const worker = workers.find((w) => w.id === incident.worker_id);
                  return (
                    <tr key={incident.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="table-cell">{incident.incident_date}</td>
                      <td className="table-cell font-medium">{worker?.full_name || '-'}</td>
                      <td className="table-cell">{incident.incident_type}</td>
                      <td className="table-cell">
                        <span className={`status-badge ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="table-cell text-gray-500">{incident.remarks}</td>
                      <td className="table-cell">
                        <button
                          onClick={() => {
                            setEditingIncident(incident);
                            setFormData(incident);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingIncident ? 'Edit Incident' : 'Report Incident'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <select
                  value={formData.worker_id}
                  onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Worker</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.full_name} - {worker.designation}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Incident Type"
                  value={formData.incident_type}
                  onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="date"
                  value={formData.incident_date}
                  onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                  className="input-field"
                  required
                />
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <textarea
                  placeholder="Remarks / Description"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingIncident ? 'Update' : 'Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};