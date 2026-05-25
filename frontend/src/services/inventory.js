import api from './api';

export const inventoryService = {
  getSuppliers: () => {
    return api.get('/api/v1/suppliers/');
  },
  
  createSupplier: (data) => {
    return api.post('/api/v1/suppliers/', data);
  },
  
  updateSupplier: (id, data) => {
    return api.put(`/api/v1/suppliers/${id}`, data);
  },
  
  deleteSupplier: (id) => {
    return api.delete(`/api/v1/suppliers/${id}`);
  },
  
  getRawMaterials: () => {
    return api.get('/api/v1/raw-materials/');
  },
  
  getRawMaterial: (id) => {
    return api.get(`/api/v1/raw-materials/${id}`);
  },
  
  createRawMaterial: (data) => {
    return api.post('/api/v1/raw-materials/', data);
  },
  
  updateRawMaterial: (id, data) => {
    return api.put(`/api/v1/raw-materials/${id}`, data);
  },
  
  deleteRawMaterial: (id) => {
    return api.delete(`/api/v1/raw-materials/${id}`);
  },
  
  updateStock: (id, quantity) => {
    return api.patch(`/api/v1/raw-materials/${id}/stock?quantity=${quantity}`);
  },
  
  getLowStock: () => {
    return api.get('/api/v1/raw-materials/low-stock');
  },
  
  getWarehouses: () => {
    return api.get('/api/v1/warehouse/');
  },
  
  getTransactions: () => {
    return api.get('/api/v1/inventory/transactions/');
  },
};