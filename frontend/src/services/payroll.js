import api from './api';

export const payrollService = {
  getPayroll: () => {
    return api.get('/api/v1/payroll/');
  },
  
  getPayrollRecord: (id) => {
    return api.get(`/api/v1/payroll/${id}`);
  },
  
  createPayroll: (data) => {
    return api.post('/api/v1/payroll/', data);
  },
  
  updatePayroll: (id, data) => {
    return api.put(`/api/v1/payroll/${id}`, data);
  },
  
  deletePayroll: (id) => {
    return api.delete(`/api/v1/payroll/${id}`);
  },
  
  getWorkerPayroll: (workerId) => {
    return api.get(`/api/v1/payroll/worker/${workerId}`);
  },
  
  getExpenses: (params) => {
    return api.get('/api/v1/expenses/', { params });
  },
  
  getExpense: (id) => {
    return api.get(`/api/v1/expenses/${id}`);
  },
  
  createExpense: (data) => {
    return api.post('/api/v1/expenses/', data);
  },
  
  updateExpense: (id, data) => {
    return api.put(`/api/v1/expenses/${id}`, data);
  },
  
  deleteExpense: (id) => {
    return api.delete(`/api/v1/expenses/${id}`);
  },
  
  getExpenseSummary: (startDate, endDate) => {
    return api.get('/api/v1/expenses/summary/total', {
      params: { start_date: startDate, end_date: endDate }
    });
  },
};