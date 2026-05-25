import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { workerService } from '../services/worker';
import { SearchBar } from '../components/Common/SearchBar';
import { ExportButton } from '../components/Common/ExportButton';
import toast from 'react-hot-toast';

export const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    designation: '',
    department_id: '',
    basic_salary: '',
    shift_type: 'general',
    status: 'active',
  });

  useEffect(() => {
    fetchWorkers();
    fetchDepartments();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await workerService.getWorkers();
      setWorkers(response.data);
    } catch (error) {
      toast.error('Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/v1/departments/');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        await workerService.updateWorker(editingWorker.id, formData);
        toast.success('Worker updated successfully');
      } else {
        await workerService.createWorker({
          ...formData,
          joining_date: new Date().toISOString().split('T')[0],
        });
        toast.success('Worker created successfully');
      }
      setShowModal(false);
      setEditingWorker(null);
      fetchWorkers();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await workerService.deleteWorker(id);
        toast.success('Worker deleted');
        fetchWorkers();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const exportColumns = [
    { key: 'employee_code', label: 'Employee Code' },
    { key: 'full_name', label: 'Full Name' },
    { key: 'designation', label: 'Designation' },
    { key: 'shift_type', label: 'Shift' },
    { key: 'basic_salary', label: 'Basic Salary' },
    { key: 'status', label: 'Status' },
  ];

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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Workers Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all factory workers and employees</p>
        </div>
        <div className="flex gap-3">
          <ExportButton data={filteredWorkers} filename="workers" columns={exportColumns} />
          <button
            onClick={() => {
              setEditingWorker(null);
              setFormData({
                full_name: '',
                email: '',
                phone: '',
                address: '',
                designation: '',
                department_id: '',
                basic_salary: '',
                shift_type: 'general',
                status: 'active',
              });
              setShowModal(true);
            }}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Worker
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b dark:border-gray-700">
          <SearchBar onSearch={setSearchTerm} placeholder="Search workers by name, code, or designation..." />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="table-header">Code</th>
                <th className="table-header">Name</th>
                <th className="table-header">Designation</th>
                <th className="table-header">Department</th>
                <th className="table-header">Shift</th>
                <th className="table-header">Salary</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="table-cell font-mono text-sm">{worker.employee_code}</td>
                  <td className="table-cell font-medium">{worker.full_name}</td>
                  <td className="table-cell text-gray-600 dark:text-gray-400">{worker.designation}</td>
                  <td className="table-cell">{worker.department_name || '-'}</td>
                  <td className="table-cell">
                    <span
                      className={`status-badge ${
                        worker.shift_type === 'morning'
                          ? 'bg-green-100 text-green-800'
                          : worker.shift_type === 'evening'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {worker.shift_type}
                    </span>
                  </td>
                  <td className="table-cell">₹{worker.basic_salary?.toLocaleString()}</td>
                  <td className="table-cell">
                    <span
                      className={`status-badge ${
                        worker.status === 'active' ? 'status-active' : 'status-inactive'
                      }`}
                    >
                      {worker.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => {
                        setEditingWorker(worker);
                        setFormData(worker);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(worker.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
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
            <h2 className="text-xl font-bold mb-4">{editingWorker ? 'Edit Worker' : 'Add Worker'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="input-field"
                  required
                />
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Basic Salary"
                  value={formData.basic_salary}
                  onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                  className="input-field"
                  required
                />
                <select
                  value={formData.shift_type}
                  onChange={(e) => setFormData({ ...formData, shift_type: e.target.value })}
                  className="input-field"
                >
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                  <option value="general">General</option>
                </select>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="suspended">Suspended</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};