import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationTriangleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

import { inventoryService } from '../services/inventory';
import { LiveCounter } from '../components/Common/LiveCounter';
import toast from 'react-hot-toast';

export const Inventory = () => {
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('materials');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('material');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    material_code: '',
    material_name: '',
    category: '',
    stock_quantity: 0,
    unit: 'kg',
    unit_price: 0,
    minimum_stock: 0,
    supplier_id: '',
    location: '',
  });
  const [supplierFormData, setSupplierFormData] = useState({
    supplier_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [materialsRes, suppliersRes, transactionsRes, lowStockRes] = await Promise.all([
        inventoryService.getRawMaterials(),
        inventoryService.getSuppliers(),
        inventoryService.getTransactions(),
        inventoryService.getLowStock(),
      ]);
      setMaterials(materialsRes.data);
      setSuppliers(suppliersRes.data);
      setTransactions(transactionsRes.data);
      setLowStock(lowStockRes.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await inventoryService.updateRawMaterial(editingItem.id, formData);
        toast.success('Material updated successfully');
      } else {
        await inventoryService.createRawMaterial(formData);
        toast.success('Material added successfully');
      }
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await inventoryService.updateSupplier(editingItem.id, supplierFormData);
        toast.success('Supplier updated successfully');
      } else {
        await inventoryService.createSupplier(supplierFormData);
        toast.success('Supplier added successfully');
      }
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleStockUpdate = async (id, quantity) => {
    try {
      await inventoryService.updateStock(id, quantity);
      toast.success('Stock updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (type === 'material') {
          await inventoryService.deleteRawMaterial(id);
        } else {
          await inventoryService.deleteSupplier(id);
        }
        toast.success('Deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const totalValue = materials.reduce((sum, m) => sum + (m.stock_quantity * m.unit_price), 0);

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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track raw materials and stock</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setModalType('material');
              setEditingItem(null);
              setFormData({
                material_code: '',
                material_name: '',
                category: '',
                stock_quantity: 0,
                unit: 'kg',
                unit_price: 0,
                minimum_stock: 0,
                supplier_id: '',
                location: '',
              });
              setShowModal(true);
            }}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Material
          </button>
          <button
            onClick={() => {
              setModalType('supplier');
              setEditingItem(null);
              setSupplierFormData({
                supplier_name: '',
                contact_person: '',
                phone: '',
                email: '',
                address: '',
              });
              setShowModal(true);
            }}
            className="btn-secondary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Supplier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <LiveCounter title="Total Materials" value={materials.length} icon={PlusIcon} color="bg-blue-500" />
        <LiveCounter title="Total Suppliers" value={suppliers.length} icon={PlusIcon} color="bg-green-500" />
        <LiveCounter title="Inventory Value" value={totalValue} unit="₹" icon={CurrencyDollarIcon} color="bg-purple-500" />
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="font-semibold text-red-700 dark:text-red-400">Low Stock Alert</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {lowStock.map((material) => (
              <div key={material.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <p className="font-medium text-sm text-gray-800 dark:text-white">{material.material_name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Stock: {material.stock_quantity} {material.unit}
                </p>
                <button
                  onClick={() => handleStockUpdate(material.id, 100)}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                >
                  Reorder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'materials'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Raw Materials ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'suppliers'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Suppliers ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'transactions'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Transactions ({transactions.length})
        </button>
      </div>

      {activeTab === 'materials' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="table-header">Code</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Stock</th>
                  <th className="table-header">Unit</th>
                  <th className="table-header">Unit Price</th>
                  <th className="table-header">Total Value</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {materials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell font-mono text-sm">{material.material_code}</td>
                    <td className="table-cell font-medium">{material.material_name}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${material.stock_quantity <= material.minimum_stock ? 'text-red-600' : ''}`}>
                          {material.stock_quantity}
                        </span>
                        <button
                          onClick={() => handleStockUpdate(material.id, 50)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <ArrowTrendingUpIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleStockUpdate(material.id, -20)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ArrowTrendingDownIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="table-cell">{material.unit}</td>
                    <td className="table-cell">₹{material.unit_price}</td>
                    <td className="table-cell">₹{(material.stock_quantity * material.unit_price).toLocaleString()}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => {
                          setEditingItem(material);
                          setFormData(material);
                          setModalType('material');
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(material.id, 'material')}
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
      )}

      {activeTab === 'suppliers' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header">Contact Person</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Address</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell font-medium">{supplier.supplier_name}</td>
                    <td className="table-cell">{supplier.contact_person}</td>
                    <td className="table-cell">{supplier.phone}</td>
                    <td className="table-cell">{supplier.email}</td>
                    <td className="table-cell text-gray-500">{supplier.address}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => {
                          setEditingItem(supplier);
                          setSupplierFormData(supplier);
                          setModalType('supplier');
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id, 'supplier')}
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
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Material</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Quantity</th>
                  <th className="table-header">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => {
                  const material = materials.find((m) => m.id === transaction.material_id);
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="table-cell">{transaction.transaction_date}</td>
                      <td className="table-cell font-medium">{material?.material_name || '-'}</td>
                      <td className="table-cell">
                        <span className={`status-badge ${
                          transaction.transaction_type === 'IN' ? 'bg-green-100 text-green-800' :
                          transaction.transaction_type === 'OUT' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.transaction_type}
                        </span>
                      </td>
                      <td className="table-cell">{transaction.quantity}</td>
                      <td className="table-cell text-gray-500">{transaction.remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit' : 'Add'} {modalType === 'material' ? 'Material' : 'Supplier'}
            </h2>
            <form onSubmit={modalType === 'material' ? handleMaterialSubmit : handleSupplierSubmit}>
              <div className="space-y-3">
                {modalType === 'material' ? (
                  <>
                    <input
                      type="text"
                      placeholder="Material Code"
                      value={formData.material_code}
                      onChange={(e) => setFormData({ ...formData, material_code: e.target.value })}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Material Name"
                      value={formData.material_name}
                      onChange={(e) => setFormData({ ...formData, material_name: e.target.value })}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                    />
                    <input
                      type="number"
                      placeholder="Stock Quantity"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: parseFloat(e.target.value) })}
                      className="input-field"
                    />
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="input-field"
                    >
                      <option value="kg">kg</option>
                      <option value="liter">Liter</option>
                      <option value="piece">Piece</option>
                      <option value="meter">Meter</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Unit Price"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                      className="input-field"
                    />
                    <input
                      type="number"
                      placeholder="Minimum Stock"
                      value={formData.minimum_stock}
                      onChange={(e) => setFormData({ ...formData, minimum_stock: parseFloat(e.target.value) })}
                      className="input-field"
                    />
                    <select
                      value={formData.supplier_id}
                      onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.supplier_name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Storage Location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input-field"
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Supplier Name"
                      value={supplierFormData.supplier_name}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, supplier_name: e.target.value })}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Contact Person"
                      value={supplierFormData.contact_person}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, contact_person: e.target.value })}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={supplierFormData.phone}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                      className="input-field"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={supplierFormData.email}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })}
                      className="input-field"
                    />
                    <textarea
                      placeholder="Address"
                      value={supplierFormData.address}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, address: e.target.value })}
                      className="input-field"
                      rows="2"
                    />
                  </>
                )}
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