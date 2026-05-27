import React, { useState, useEffect } from 'react';
import { TruckIcon, MapPinIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { salesService } from '../services/sales';
import { PageLoader } from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

export const DeliveryTracking = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [updateData, setUpdateData] = useState({ 
    delivery_status: '', 
    current_location: '' 
  });

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await salesService.getDeliveries();
      setDeliveries(response.data);
    } catch (error) {
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await salesService.updateDelivery(selectedDelivery.id, updateData);
      toast.success('Delivery status updated');
      setShowUpdateModal(false);
      fetchDeliveries();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      dispatched: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-yellow-100 text-yellow-800',
      delivered: 'bg-green-100 text-green-800',
      delayed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100';
  };

  const filteredDeliveries = selectedStatus === 'all' 
    ? deliveries 
    : deliveries.filter(d => d.delivery_status === selectedStatus);

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Delivery Tracking</h1>
        <p className="text-gray-600">Track vehicle deliveries</p>
      </div>

      <div className="flex gap-3 mb-6">
        {['all', 'pending', 'dispatched', 'in_transit', 'delivered', 'delayed'].map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              selectedStatus === status 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDeliveries.map(d => (
          <div key={d.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">Tracking: {d.tracking_number}</h3>
                <p className="text-sm text-gray-500">Customer: {d.customer_name}</p>
              </div>
              <span className={`status-badge ${getStatusColor(d.delivery_status)}`}>
                {d.delivery_status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Expected:</span> {d.expected_delivery}
              </p>
              <p>
                <span className="font-medium">Current Location:</span> {d.current_location || 'Not available'}
              </p>
              <p>
                <span className="font-medium">Carrier:</span> {d.carrier_name || 'N/A'}
              </p>
              <p>
                <span className="font-medium">Driver:</span> {d.driver_name} ({d.driver_phone})
              </p>
            </div>
            {d.delivery_status !== 'delivered' && (
              <button
                onClick={() => {
                  setSelectedDelivery(d);
                  setUpdateData({ 
                    delivery_status: d.delivery_status, 
                    current_location: d.current_location 
                  });
                  setShowUpdateModal(true);
                }}
                className="btn-primary mt-4 w-full"
              >
                Update Status
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Delivery</h2>
            <form onSubmit={handleUpdate}>
              <div className="space-y-3">
                <select
                  value={updateData.delivery_status}
                  onChange={(e) => setUpdateData({ ...updateData, delivery_status: e.target.value })}
                  className="input-field"
                >
                  <option value="pending">Pending</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="delayed">Delayed</option>
                </select>
                <input
                  type="text"
                  placeholder="Current Location"
                  value={updateData.current_location}
                  onChange={(e) => setUpdateData({ ...updateData, current_location: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowUpdateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};