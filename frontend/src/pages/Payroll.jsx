import React, { useState, useEffect } from 'react';
import { PlusIcon, CheckCircleIcon, ClockIcon, CurrencyDollarIcon, UsersIcon, PencilIcon } from '@heroicons/react/24/outline';

import { payrollService } from '../services/payroll';
import { workerService } from '../services/worker';
import { LiveCounter } from '../components/Common/LiveCounter';
import toast from 'react-hot-toast';

export const Payroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    worker_id: '',
    basic_salary: 0,
    overtime_amount: 0,
    deductions: 0,
    final_salary: 0,
    payment_status: 'pending',
    payment_date: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [payrollRes, workersRes] = await Promise.all([
        payrollService.getPayroll(),
        workerService.getWorkers(),
      ]);
      setPayroll(payrollRes.data);
      setWorkers(workersRes.data);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalSalary = formData.basic_salary + formData.overtime_amount - formData.deductions;
    try {
      if (editingItem) {
        await payrollService.updatePayroll(editingItem.id, { ...formData, final_salary: finalSalary });
        toast.success('Payroll updated successfully');
      } else {
        await payrollService.createPayroll({ ...formData, final_salary: finalSalary });
        toast.success('Payroll record created');
      }
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handlePaymentStatus = async (id, status) => {
    try {
      await payrollService.updatePayroll(id, {
        payment_status: status,
        payment_date: status === 'paid' ? new Date().toISOString().split('T')[0] : null,
      });
      toast.success(`Payment marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const totalPayroll = payroll.reduce((sum, p) => sum + (p.final_salary || 0), 0);
  const pendingPayroll = payroll.filter((p) => p.payment_status === 'pending').reduce((sum, p) => sum + (p.final_salary || 0), 0);

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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Payroll Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage employee salaries</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              worker_id: '',
              basic_salary: 0,
              overtime_amount: 0,
              deductions: 0,
              final_salary: 0,
              payment_status: 'pending',
              payment_date: null,
            });
            setShowModal(true);
          }}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Generate Payroll
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <LiveCounter title="Total Payroll" value={totalPayroll} unit="₹" icon={CurrencyDollarIcon} color="bg-blue-500" />
        <LiveCounter title="Pending Payroll" value={pendingPayroll} unit="₹" icon={ClockIcon} color="bg-yellow-500" />
        <LiveCounter title="Employees" value={workers.length} icon={UsersIcon} color="bg-green-500" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="table-header">Employee</th>
                <th className="table-header">Basic Salary</th>
                <th className="table-header">Overtime</th>
                <th className="table-header">Deductions</th>
                <th className="table-header">Final Salary</th>
                <th className="table-header">Status</th>
                <th className="table-header">Payment Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {payroll.map((record) => {
                const worker = workers.find((w) => w.id === record.worker_id);
                return (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell font-medium">
                      {worker?.full_name}
                      <p className="text-xs text-gray-500">{worker?.employee_code}</p>
                    </td>
                    <td className="table-cell">₹{record.basic_salary?.toLocaleString()}</td>
                    <td className="table-cell">₹{record.overtime_amount?.toLocaleString()}</td>
                    <td className="table-cell">₹{record.deductions?.toLocaleString()}</td>
                    <td className="table-cell font-bold">₹{record.final_salary?.toLocaleString()}</td>
                    <td className="table-cell">
                      {record.payment_status === 'paid' ? (
                        <span className="status-badge bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-3 w-3 inline mr-1" />
                          Paid
                        </span>
                      ) : (
                        <span className="status-badge bg-yellow-100 text-yellow-800">
                          <ClockIcon className="h-3 w-3 inline mr-1" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="table-cell">{record.payment_date || '-'}</td>
                    <td className="table-cell">
                      {record.payment_status === 'pending' ? (
                        <button
                          onClick={() => handlePaymentStatus(record.id, 'paid')}
                          className="btn-primary text-sm py-1 px-2"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingItem(record);
                            setFormData(record);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                    </td>
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
            <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Payroll' : 'Generate Payroll'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <select
                  value={formData.worker_id}
                  onChange={(e) => {
                    const selectedWorker = workers.find((w) => w.id === parseInt(e.target.value));
                    setFormData({
                      ...formData,
                      worker_id: e.target.value,
                      basic_salary: selectedWorker?.basic_salary || 0,
                    });
                  }}
                  className="input-field"
                  required
                  disabled={editingItem}
                >
                  <option value="">Select Employee</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.full_name} - {worker.designation}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Basic Salary"
                  value={formData.basic_salary}
                  onChange={(e) => setFormData({ ...formData, basic_salary: parseFloat(e.target.value) })}
                  className="input-field"
                  required
                />
                <input
                  type="number"
                  placeholder="Overtime Amount"
                  value={formData.overtime_amount}
                  onChange={(e) => setFormData({ ...formData, overtime_amount: parseFloat(e.target.value) })}
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder="Deductions (Tax, PF, etc.)"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) })}
                  className="input-field"
                />
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Final Salary</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{(formData.basic_salary + formData.overtime_amount - formData.deductions).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Update' : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};