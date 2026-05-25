import api from './api';

export const machineryService = {
  getMachinery: () => {
    return api.get('/api/v1/machinery/');
  },
  
  getMachine: (id) => {
    return api.get(`/api/v1/machinery/${id}`);
  },
  
  createMachine: (data) => {
    return api.post('/api/v1/machinery/', data);
  },
  
  updateMachine: (id, data) => {
    return api.put(`/api/v1/machinery/${id}`, data);
  },
  
  deleteMachine: (id) => {
    return api.delete(`/api/v1/machinery/${id}`);
  },
  
  getRobotics: () => {
    return api.get('/api/v1/robotics/');
  },
  
  getMaintenanceLogs: () => {
    return api.get('/api/v1/maintenance/logs');
  },
  
  createMaintenanceLog: (data) => {
    return api.post('/api/v1/maintenance/logs', data);
  },
  
  getMaintenanceCostReport: (machineId) => {
    return api.get(`/api/v1/maintenance/machine/${machineId}/cost-report`);
  },
};