import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { salesService } from '../services/sales';
import { SearchBar } from '../components/Common/SearchBar';
import { ExportButton } from '../components/Common/ExportButton';
import toast from 'react-hot-toast';

export const DealerManagement = () => {
  const [dealers, setDealers] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    dealer_code: '',
    dealer_name: '',
    showroom_id: '',
    state: '',
    city: '',
    contact_person: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dealersRes, showroomsRes] = await Promise.all([
        salesService.getDealers(),
        salesService.getShowrooms(),
      ]);
      setDealers(dealersRes.data);
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
      if (editingDealer) {
        await salesService.updateDealer(editingDealer.id, formData);
        toast.success('Dealer updated successfully');
      } else {
        await salesService.createDealer(formData);
        toast.success('Dealer created successfully');
      }
      setShowModal(false);
      setEditingDealer(null);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this dealer?')) {
      try {
        await salesService.deleteDealer(id);
        toast.success('Dealer deleted');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const getShowroomName = (showroomId) => {
    const showroom = showrooms.find(s => s.id === showroomId);
    return showroom?.showroom_name || 'N/A';
  };

  const filteredDealers = dealers.filter(d =>
    d.dealer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.dealer_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportColumns = [
    { key: 'dealer_code', label: 'Code' },
    { key: 'dealer_name', label: 'Name' },
    { key: 'showroom_name', label: 'Showroom' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'phone', label: 'Phone' },
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Dealer Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all dealers and distributors
          </p>
        </div>
        <div className="flex gap-3">
          <ExportButton 
            data={filteredDealers.map(d => ({ 
              ...d, 
              showroom_name: getShowroomName(d.showroom_id) 
            }))} 
            filename="dealers" 
            columns={exportColumns} 
          />
          <button 
            onClick={() => { 
              setEditingDealer(null); 
              setFormData({ 
                dealer_code: '', 
                dealer_name: '', 
                showroom_id: '', 
                state: '', 
                city: '', 
                contact_person: '', 
                phone: '', 
                email: '' 
              }); 
              setShowModal(true); 
            }} 
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Dealer
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b">
          <SearchBar 
            onSearch={setSearchTerm} 
            placeholder="Search by name, code, or city..." 
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="table-header">Code</th>
                <th className="table-header">Name</th>
                <th className="table-header">Showroom</th>
                <th className="table-header">City</th>
                <th className="table-header">State</th>
                <th className="table-header">Contact Person</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDealers.map((d) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="table-cell">{d.dealer_code}</td>
                  <td className="table-cell font-medium">{d.dealer_name}</td>
                  <td className="table-cell">{getShowroomName(d.showroom_id)}</td>
                  <td className="table-cell">{d.city}</td>
                  <td className="table-cell">{d.state}</td>
                  <td className="table-cell">{d.contact_person}</td>
                  <td className="table-cell">{d.phone}</td>
                  <td className="table-cell">
                    <button 
                      onClick={() => { 
                        setEditingDealer(d); 
                        setFormData(d); 
                        setShowModal(true); 
                      }} 
                      className="text-blue-600 mr-3"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(d.id)} 
                      className="text-red-600"
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
            <h2 className="text-xl font-bold mb-4">
              {editingDealer ? 'Edit Dealer' : 'Add Dealer'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Dealer Code" 
                  value={formData.dealer_code} 
                  onChange={(e) => setFormData({ ...formData, dealer_code: e.target.value })} 
                  className="input-field" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Dealer Name" 
                  value={formData.dealer_name} 
                  onChange={(e) => setFormData({ ...formData, dealer_name: e.target.value })} 
                  className="input-field" 
                  required 
                />
                <select 
                  value={formData.showroom_id} 
                  onChange={(e) => setFormData({ ...formData, showroom_id: e.target.value })} 
                  className="input-field" 
                  required
                >
                  <option value="">Select Showroom</option>
                  {showrooms.map(s => (
                    <option key={s.id} value={s.id}>{s.showroom_name}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  placeholder="State" 
                  value={formData.state} 
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })} 
                  className="input-field" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="City" 
                  value={formData.city} 
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                  className="input-field" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Contact Person" 
                  value={formData.contact_person} 
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} 
                  className="input-field" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Phone" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
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
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn-secondary"
                >
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