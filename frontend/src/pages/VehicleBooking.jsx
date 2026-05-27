import React, { useState, useEffect } from 'react';
import { CalendarIcon, CurrencyDollarIcon, UserIcon, CarIcon } from '@heroicons/react/24/outline';
import { salesService } from '../services/sales';
import { PageLoader } from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

export const VehicleBooking = () => {
  const [customers, setCustomers] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_model_id: '',
    showroom_id: '',
    booking_date: new Date().toISOString().split('T')[0],
    booking_amount: 10000,
    booking_status: 'confirmed',
  });
  const [customerForm, setCustomerForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    aadhaar_number: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, modelsRes, showroomsRes] = await Promise.all([
        salesService.getCustomers(),
        salesService.getVehicleModels(),
        salesService.getShowrooms(),
      ]);
      setCustomers(customersRes.data);
      setVehicleModels(modelsRes.data);
      setShowrooms(showroomsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await salesService.createBooking(formData);
      toast.success('Booking created successfully');
      setFormData({
        customer_id: '',
        vehicle_model_id: '',
        showroom_id: '',
        booking_date: new Date().toISOString().split('T')[0],
        booking_amount: 10000,
        booking_status: 'confirmed',
      });
    } catch (error) {
      toast.error('Booking failed');
    }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await salesService.createCustomer(customerForm);
      toast.success('Customer created successfully');
      setCustomers([...customers, response.data]);
      setFormData({ ...formData, customer_id: response.data.id });
      setShowCustomerModal(false);
      setCustomerForm({ 
        customer_name: '', 
        phone: '', 
        email: '', 
        city: '', 
        state: '', 
        aadhaar_number: '' 
      });
    } catch (error) {
      toast.error('Failed to create customer');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Vehicle Booking
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Book a vehicle for customer
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="label">Select Customer</label>
            <div className="flex gap-3">
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="input-field flex-1"
                required
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.customer_name} - {c.phone}
                  </option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={() => setShowCustomerModal(true)} 
                className="btn-secondary whitespace-nowrap"
              >
                + New Customer
              </button>
            </div>
          </div>

          {/* Vehicle Model */}
          <div>
            <label className="label">Select Vehicle Model</label>
            <select
              value={formData.vehicle_model_id}
              onChange={(e) => setFormData({ ...formData, vehicle_model_id: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select Vehicle Model</option>
              {vehicleModels.map(v => (
                <option key={v.id} value={v.id}>
                  {v.model_name} - {v.variant} (₹{v.ex_showroom_price.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Showroom */}
          <div>
            <label className="label">Select Showroom</label>
            <select
              value={formData.showroom_id}
              onChange={(e) => setFormData({ ...formData, showroom_id: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select Showroom</option>
              {showrooms.map(s => (
                <option key={s.id} value={s.id}>
                  {s.showroom_name} - {s.city}
                </option>
              ))}
            </select>
          </div>

          {/* Booking Date */}
          <div>
            <label className="label">Booking Date</label>
            <input 
              type="date" 
              value={formData.booking_date} 
              onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })} 
              className="input-field" 
              required 
            />
          </div>

          {/* Booking Amount */}
          <div>
            <label className="label">Booking Amount (₹)</label>
            <input 
              type="number" 
              value={formData.booking_amount} 
              onChange={(e) => setFormData({ ...formData, booking_amount: parseInt(e.target.value) })} 
              className="input-field" 
              required 
            />
          </div>

          {/* Booking Status */}
          <div>
            <label className="label">Booking Status</label>
            <select 
              value={formData.booking_status} 
              onChange={(e) => setFormData({ ...formData, booking_status: e.target.value })} 
              className="input-field"
            >
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full py-3">
            Create Booking
          </button>
        </form>
      </div>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
            <form onSubmit={handleCustomerSubmit}>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Customer Name" 
                  value={customerForm.customer_name} 
                  onChange={(e) => setCustomerForm({ ...customerForm, customer_name: e.target.value })} 
                  className="input-field" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Phone" 
                  value={customerForm.phone} 
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} 
                  className="input-field" 
                  required 
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={customerForm.email} 
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} 
                  className="input-field" 
                />
                <input 
                  type="text" 
                  placeholder="City" 
                  value={customerForm.city} 
                  onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })} 
                  className="input-field" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="State" 
                  value={customerForm.state} 
                  onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value })} 
                  className="input-field" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Aadhaar Number" 
                  value={customerForm.aadhaar_number} 
                  onChange={(e) => setCustomerForm({ ...customerForm, aadhaar_number: e.target.value })} 
                  className="input-field" 
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowCustomerModal(false)} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};