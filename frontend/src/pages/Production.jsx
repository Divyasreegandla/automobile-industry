import React, { useState, useEffect } from 'react';
import { PlusIcon, PlayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { productionService } from '../services/production';
import { reportsService } from '../services/reports';
import { LiveCounter } from '../components/Common/LiveCounter';
import toast from 'react-hot-toast';

export const Production = () => {
  const [vehicles, setVehicles] = useState([]);
  const [productionLines, setProductionLines] = useState([]);
  const [liveStats, setLiveStats] = useState({ completed: 0, inProgress: 0, qualityCheck: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_model: '',
    production_line_id: '',
    chassis_number: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchLiveData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesRes, linesRes] = await Promise.all([
        productionService.getVehicles(),
        productionService.getProductionLines(),
      ]);
      setVehicles(vehiclesRes.data);
      setProductionLines(linesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load production data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveData = async () => {
    try {
      const response = await reportsService.getLiveProduction();
      setLiveStats(response.data);
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    try {
      await productionService.createVehicle(formData);
      toast.success('Vehicle production started');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to start production');
    }
  };

  const handleStageUpdate = async (id, stage) => {
    try {
      await productionService.updateVehicleStage(id, stage);
      toast.success(`Production stage updated to ${stage}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update stage');
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      planned: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      quality_check: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[stage] || 'bg-gray-100';
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Production Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400">Track vehicle manufacturing</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Start Production
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <LiveCounter
          title="Completed Today"
          value={liveStats.completed || 0}
          icon={CheckCircleIcon}
          color="bg-green-500"
        />
        <LiveCounter
          title="In Progress"
          value={liveStats.inProgress || 0}
          icon={PlayIcon}
          color="bg-blue-500"
        />
        <LiveCounter
          title="Quality Check"
          value={liveStats.qualityCheck || 0}
          icon={CheckCircleIcon}
          color="bg-yellow-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="table-header">Chassis No</th>
                <th className="table-header">Model</th>
                <th className="table-header">Line</th>
                <th className="table-header">Stage</th>
                <th className="table-header">Start Date</th>
                <th className="table-header">Cost</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="table-cell font-mono text-sm">{vehicle.chassis_number}</td>
                  <td className="table-cell font-medium">{vehicle.vehicle_model}</td>
                  <td className="table-cell">
                    {productionLines.find((l) => l.id === vehicle.production_line_id)?.line_name || '-'}
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${getStageColor(vehicle.production_stage)}`}>
                      {vehicle.production_stage?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="table-cell">{vehicle.start_date}</td>
                  <td className="table-cell">₹{vehicle.production_cost?.toLocaleString()}</td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      {vehicle.production_stage === 'planned' && (
                        <button
                          onClick={() => handleStageUpdate(vehicle.id, 'in_progress')}
                          className="btn-primary text-sm py-1 px-2"
                        >
                          Start
                        </button>
                      )}
                      {vehicle.production_stage === 'in_progress' && (
                        <button
                          onClick={() => handleStageUpdate(vehicle.id, 'quality_check')}
                          className="btn-secondary text-sm py-1 px-2"
                        >
                          Quality Check
                        </button>
                      )}
                      {vehicle.production_stage === 'quality_check' && (
                        <>
                          <button
                            onClick={() => handleStageUpdate(vehicle.id, 'completed')}
                            className="bg-green-600 text-white text-sm py-1 px-2 rounded"
                          >
                            Pass
                          </button>
                          <button
                            onClick={() => handleStageUpdate(vehicle.id, 'rejected')}
                            className="bg-red-600 text-white text-sm py-1 px-2 rounded"
                          >
                            Fail
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Start Production</h2>
            <form onSubmit={handleCreateVehicle}>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Vehicle Model"
                  value={formData.vehicle_model}
                  onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="Chassis Number"
                  value={formData.chassis_number}
                  onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value })}
                  className="input-field"
                  required
                />
                <select
                  value={formData.production_line_id}
                  onChange={(e) => setFormData({ ...formData, production_line_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Production Line</option>
                  {productionLines.map((line) => (
                    <option key={line.id} value={line.id}>
                      {line.line_name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Start Production
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};