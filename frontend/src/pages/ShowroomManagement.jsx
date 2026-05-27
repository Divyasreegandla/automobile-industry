import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { salesService } from '../services/sales';
import { SearchBar } from '../components/Common/SearchBar';
import { ExportButton } from '../components/Common/ExportButton';
import toast from 'react-hot-toast';

export const ShowroomManagement = () => {
  const [showrooms, setShowrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShowroom, setEditingShowroom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    showroom_code: '',
    showroom_name: '',
    state: '',
    city: '',
    address: '',
    manager_name: '',
    contact_number: '',
  });

  useEffect(() => {
    fetchShowrooms();
  }, []);

  const fetchShowrooms = async () => {
    try {
      const response = await salesService.getShowrooms();
      setShowrooms(response.data);
    } catch (error) {
      toast.error('Failed to fetch showrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingShowroom) {
        await salesService.updateShowroom(editingShowroom.id, formData);
        toast.success('Showroom updated successfully');
      } else {
        await salesService.createShowroom(formData);
        toast.success('Showroom created successfully');
      }
      setShowModal(false);
      setEditingShowroom(null);
      fetchShowrooms();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this showroom?')) {
      try {
        await salesService.deleteShowroom(id);
        toast.success('Showroom deleted');
        fetchShowrooms();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const filteredShowrooms = showrooms.filter(s =>
    s.showroom_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.showroom_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportColumns = [
    { key: 'showroom_code', label: 'Code' },
    { key: 'showroom_name', label: 'Name' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'manager_name', label: 'Manager' },
    { key: 'contact_number', label: 'Contact' },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Showroom Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all showrooms and branches</p>
        </div>
        <div className="flex gap-3">
          <ExportButton data={filteredShowrooms} filename="showrooms" columns={exportColumns} />
          <button onClick={() => { setEditingShowroom(null); setFormData({ showroom_code: '', showroom_name: '', state: '', city: '', address: '', manager_name: '', contact_number: '' }); setShowModal(true); }} className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Showroom
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b">
          <SearchBar onSearch={setSearchTerm} placeholder="Search by name, code, or city..." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="table-header">Code</th>
                <th className="table-header">Name</th>
                <th className="table-header">City</th>
                <th className="table-header">State</th>
                <th className="table-header">Manager</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShowrooms.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="table-cell">{s.showroom_code}</td>
                  <td className="table-cell font-medium">{s.showroom_name}</td>
                  <td className="table-cell">{s.city}</td>
                  <td className="table-cell">{s.state}</td>
                  <td className="table-cell">{s.manager_name}</td>
                  <td className="table-cell">{s.contact_number}</td>
                  <td className="table-cell">
                    <button onClick={() => { setEditingShowroom(s); setFormData(s); setShowModal(true); }} className="text-blue-600 mr-3"><PencilIcon className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600"><TrashIcon className="h-4 w-4" /></button>
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
            <h2 className="text-xl font-bold mb-4">{editingShowroom ? 'Edit Showroom' : 'Add Showroom'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <input type="text" placeholder="Showroom Code" value={formData.showroom_code} onChange={(e) => setFormData({ ...formData, showroom_code: e.target.value })} className="input-field" required />
                <input type="text" placeholder="Showroom Name" value={formData.showroom_name} onChange={(e) => setFormData({ ...formData, showroom_name: e.target.value })} className="input-field" required />
                <input type="text" placeholder="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="input-field" required />
                <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="input-field" required />
                <textarea placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-field" rows="2" />
                <input type="text" placeholder="Manager Name" value={formData.manager_name} onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })} className="input-field" required />
                <input type="text" placeholder="Contact Number" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} className="input-field" required />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};