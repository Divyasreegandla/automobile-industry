import api from './api';

export const productionService = {
  getProductionLines: () => {
    return api.get('/api/v1/production/lines/');
  },
  
  getProductionLine: (id) => {
    return api.get(`/api/v1/production/lines/${id}`);
  },
  
  createProductionLine: (data) => {
    return api.post('/api/v1/production/lines/', data);
  },
  
  getVehicles: () => {
    return api.get('/api/v1/production/vehicles/');
  },
  
  getVehicle: (id) => {
    return api.get(`/api/v1/production/vehicles/${id}`);
  },
  
  createVehicle: (data) => {
    return api.post('/api/v1/production/vehicles/', data);
  },
  
  updateVehicle: (id, data) => {
    return api.put(`/api/v1/production/vehicles/${id}`, data);
  },
  
  updateVehicleStage: (id, stage) => {
    return api.patch(`/api/v1/production/vehicles/${id}/stage?stage=${stage}`);
  },
  
  getQualityChecks: () => {
    return api.get('/api/v1/production/quality-checks/');
  },
  
  createQualityCheck: (data) => {
    return api.post('/api/v1/production/quality-checks/', data);
  },
  
  getProductionStats: () => {
    return api.get('/api/v1/production/dashboard/stats');
  },
};