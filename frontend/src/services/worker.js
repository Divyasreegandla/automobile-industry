import api from './api';

export const workerService = {
  getWorkers: (params) => {
    return api.get('/api/v1/workers/', { params });
  },
  
  getWorker: (id) => {
    return api.get(`/api/v1/workers/${id}`);
  },
  
  createWorker: (data) => {
    return api.post('/api/v1/workers/', data);
  },
  
  updateWorker: (id, data) => {
    return api.put(`/api/v1/workers/${id}`, data);
  },
  
  deleteWorker: (id) => {
    return api.delete(`/api/v1/workers/${id}`);
  },
  
  getAttendance: (params) => {
    return api.get('/api/v1/attendance/', { params });
  },
  
  createAttendance: (data) => {
    return api.post('/api/v1/attendance/', data);
  },
  
  updateAttendance: (id, data) => {
    return api.put(`/api/v1/attendance/${id}`, data);
  },
  
  getWorkerAttendance: (workerId) => {
    return api.get(`/api/v1/attendance/worker/${workerId}`);
  },
};