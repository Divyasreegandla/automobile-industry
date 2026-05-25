import api from './api';

export const reportsService = {
  getDailyProduction: (date) => {
    return api.get('/api/v1/reports/production/daily', {
      params: { report_date: date }
    });
  },
  
  getMonthlyProduction: (year, month) => {
    return api.get('/api/v1/reports/production/monthly', {
      params: { year, month }
    });
  },
  
  getQualitySummary: (startDate, endDate) => {
    return api.get('/api/v1/reports/quality/summary', {
      params: { start_date: startDate, end_date: endDate }
    });
  },
  
  getExpenseReport: (startDate, endDate) => {
    return api.get('/api/v1/reports/cost/expenses', {
      params: { start_date: startDate, end_date: endDate }
    });
  },
  
  getProductionCostReport: (startDate, endDate) => {
    return api.get('/api/v1/reports/cost/production', {
      params: { start_date: startDate, end_date: endDate }
    });
  },
  
  getMachinePerformance: () => {
    return api.get('/api/v1/reports/machinery/performance');
  },
  
  getMonthlyAttendance: (year, month) => {
    return api.get('/api/v1/reports/attendance/monthly', {
      params: { year, month }
    });
  },
  
  getMonthlyPayroll: (year, month) => {
    return api.get('/api/v1/reports/payroll/monthly', {
      params: { year, month }
    });
  },
  
  getDashboardAnalytics: () => {
    return api.get('/api/v1/reports/dashboard');
  },
  
  getSafetyDashboard: () => {
    return api.get('/api/v1/safety/dashboard/summary');
  },
  
  getMachineStatus: () => {
    return api.get('/api/v1/iot/machine-status');
  },
  
  getRobotStatus: () => {
    return api.get('/api/v1/iot/robot-status');
  },
  
  getLiveProduction: () => {
    return api.get('/api/v1/iot/production-live');
  },
  
  getFactoryDashboard: () => {
    return api.get('/api/v1/iot/factory-dashboard');
  },
  
  predictProduction: (daysAhead) => {
    return api.get('/api/v1/ai/predict/production', {
      params: { days_ahead: daysAhead }
    });
  },
  
  predictQuality: (daysAhead) => {
    return api.get('/api/v1/ai/predict/quality', {
      params: { days_ahead: daysAhead }
    });
  },
  
  predictMaintenance: (machineId) => {
    return api.get('/api/v1/ai/predict/maintenance', {
      params: { machine_id: machineId }
    });
  },
  
  getAIDashboard: () => {
    return api.get('/api/v1/ai/dashboard');
  },
};