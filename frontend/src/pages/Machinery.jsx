import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, WrenchIcon } from '@heroicons/react/24/outline';
import { machineryService } from '../services/machinery';
import { reportsService } from '../services/reports';
import toast from 'react-hot-toast';

export const Machinery = () => {
  const [machines, setMachines] = useState([]);
  const [robots, setRobots] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('machines');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    machine_code: '',
    machine_name: '',
    machine_type: '',
    manufacturer: '',
    department_id: 1,
    purchase_date: '',
    current_status: 'operational',
    running_hours: 0,
  });
  const [robotFormData, setRobotFormData] = useState({
    robot_code: '',
    robot_name: '',
    automation_type: 'assembly',
    manufacturer: '',
    department_id: 1,
    purchase_date: '',
    current_status: 'operational',
    operating_hours: 0,
  });

  useEffect(() => {
    fetchData();
    fetchPredictions();
  }, []);

  const fetchData = async () => {
    try {
      const [machinesRes, robotsRes, logsRes] = await Promise.all([
        machineryService.getMachinery(),
        machineryService.getRobotics(),
        machineryService.getMaintenanceLogs(),
      ]);
      setMachines(machinesRes.data);
      setRobots(robotsRes.data);
      setMaintenanceLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching machinery data:', error);
      toast.error('Failed to load machinery data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictions = async () => {
    try {
      const response = await reportsService.predictMaintenance();
      setPredictions(response.data?.predictions || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const handleMachineSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await machineryService.updateMachine(editingItem.id, formData);
        toast.success('Machine updated successfully');
      } else {
        await machineryService.createMachine(formData);
        toast.success('Machine added successfully');
      }
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleRobotSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await machineryService.updateRobot(editingItem.id, robotFormData);
        toast.success('Robot updated successfully');
      } else {
        await machineryService.createRobot(robotFormData);
        toast.success('Robot added successfully');
      }
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (type === 'machine') {
          await machineryService.deleteMachine(id);
        } else {
          await machineryService.deleteRobot(id);
        }
        toast.success('Deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      operational: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      repair: 'bg-red-100 text-red-800',
      idle: 'bg-gray-100 text-gray-800',
      charging: 'bg-blue-100 text-blue-800',
      error: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100';
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Machinery & Robotics</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor equipment and robots</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setActiveTab('machines');
              setEditingItem(null);
              setFormData({
                machine_code: '',
                machine_name: '',
                machine_type: '',
                manufacturer: '',
                department_id: 1,
                purchase_date: new Date().toISOString().split('T')[0],
                current_status: 'operational',
                running_hours: 0,
              });
              setShowModal(true);
            }}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Machine
          </button>
          <button
            onClick={() => {
              setActiveTab('robots');
              setEditingItem(null);
              setRobotFormData({
                robot_code: '',
                robot_name: '',
                automation_type: 'assembly',
                manufacturer: '',
                department_id: 1,
                purchase_date: new Date().toISOString().split('T')[0],
                current_status: 'operational',
                operating_hours: 0,
              });
              setShowModal(true);
            }}
            className="btn-secondary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Robot
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('machines')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'machines'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Machines ({machines.length})
        </button>
        <button
          onClick={() => setActiveTab('robots')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'robots'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Robots ({robots.length})
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'predictions'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Predictive Alerts ({predictions.length})
        </button>
      </div>

      {activeTab === 'machines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((machine) => (
            <div key={machine.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{machine.machine_name}</h3>
                  <p className="text-sm text-gray-500">{machine.machine_code}</p>
                </div>
                <span className={`status-badge ${getStatusColor(machine.current_status)}`}>
                  {machine.current_status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Type:</span> {machine.machine_type}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Running Hours:</span> {machine.running_hours} hrs
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Last Maintenance:</span>{' '}
                  {machine.last_maintenance_date || 'Never'}
                </p>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t dark:border-gray-700">
                <button
                  onClick={() => {
                    setEditingItem(machine);
                    setFormData(machine);
                    setActiveTab('machines');
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(machine.id, 'machine')}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'robots' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {robots.map((robot) => (
            <div key={robot.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{robot.robot_name}</h3>
                  <p className="text-sm text-gray-500">{robot.robot_code}</p>
                </div>
                <span className={`status-badge ${getStatusColor(robot.current_status)}`}>
                  {robot.current_status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Type:</span> {robot.automation_type}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Operating Hours:</span> {robot.operating_hours} hrs
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Energy Consumption:</span> {robot.energy_consumption || 0} kWh
                </p>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t dark:border-gray-700">
                <button
                  onClick={() => {
                    setEditingItem(robot);
                    setRobotFormData(robot);
                    setActiveTab('robots');
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(robot.id, 'robot')}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-4">
          {predictions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <WrenchIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No maintenance predictions available</p>
            </div>
          ) : (
            predictions.map((prediction) => (
              <div
                key={prediction.machine_id}
                className={`p-4 rounded-lg border ${
                  prediction.status === 'urgent'
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {prediction.machine_name}
                    </h3>
                    <p className="text-sm mt-1">
                      {prediction.days_until_next_maintenance} days until next maintenance
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{prediction.recommendation}</p>
                  </div>
                  <span
                    className={`status-badge ${
                      prediction.status === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {prediction.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit' : 'Add'} {activeTab === 'machines' ? 'Machine' : 'Robot'}
            </h2>
            <form onSubmit={activeTab === 'machines' ? handleMachineSubmit : handleRobotSubmit}>
              <div className="space-y-3">
                {activeTab === 'machines' ? (
                  <>
                    <input
                      type="text"
                      placeholder="Machine Code"
                      value={formData.machine_code}
                      onChange={(e) => setFormData({ ...formData, machine_code: e.target.value })}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Machine Name"
                      value={formData.machine_name}
                      onChange={(e) => setFormData({ ...formData, machine_name: e.target.value })}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Machine Type"
                      value={formData.machine_type}
                      onChange={(e) => setFormData({ ...formData, machine_type: e.target.value })}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      className="input-field"
                    />
                    <input
                      type="date"
                      placeholder="Purchase Date"
                      value={formData.purchase_date}
                      onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                      className="input-field"
                    />
                    <input
                      type="number"
                      placeholder="Running Hours"
                      value={formData.running_hours}
                      onChange={(e) => setFormData({ ...formData, running_hours: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Robot Code"
                      value={robotFormData.robot_code}
                      onChange={(e) => setRobotFormData({ ...robotFormData, robot_code: e.target.value })}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Robot Name"
                      value={robotFormData.robot_name}
                      onChange={(e) => setRobotFormData({ ...robotFormData, robot_name: e.target.value })}
                      className="input-field"
                      required
                    />
                    <select
                      value={robotFormData.automation_type}
                      onChange={(e) => setRobotFormData({ ...robotFormData, automation_type: e.target.value })}
                      className="input-field"
                    >
                      <option value="assembly">Assembly</option>
                      <option value="welding">Welding</option>
                      <option value="painting">Painting</option>
                      <option value="packaging">Packaging</option>
                      <option value="inspection">Inspection</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Manufacturer"
                      value={robotFormData.manufacturer}
                      onChange={(e) => setRobotFormData({ ...robotFormData, manufacturer: e.target.value })}
                      className="input-field"
                    />
                    <input
                      type="number"
                      placeholder="Operating Hours"
                      value={robotFormData.operating_hours}
                      onChange={(e) => setRobotFormData({ ...robotFormData, operating_hours: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </>
                )}
                <select
                  value={activeTab === 'machines' ? formData.current_status : robotFormData.current_status}
                  onChange={(e) => {
                    if (activeTab === 'machines') {
                      setFormData({ ...formData, current_status: e.target.value });
                    } else {
                      setRobotFormData({ ...robotFormData, current_status: e.target.value });
                    }
                  }}
                  className="input-field"
                >
                  <option value="operational">Operational</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="idle">Idle</option>
                  <option value="repair">Repair</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};