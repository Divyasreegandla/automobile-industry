import api from './api';

export const salesService = {
  // Showrooms
  getShowrooms: () => api.get('/api/v1/showrooms/'),
  getShowroom: (id) => api.get(`/api/v1/showrooms/${id}`),
  createShowroom: (data) => api.post('/api/v1/showrooms/', data),
  updateShowroom: (id, data) => api.put(`/api/v1/showrooms/${id}`, data),
  deleteShowroom: (id) => api.delete(`/api/v1/showrooms/${id}`),
  
  // Dealers
  getDealers: () => api.get('/api/v1/dealers/'),
  getDealer: (id) => api.get(`/api/v1/dealers/${id}`),
  createDealer: (data) => api.post('/api/v1/dealers/', data),
  updateDealer: (id, data) => api.put(`/api/v1/dealers/${id}`, data),
  deleteDealer: (id) => api.delete(`/api/v1/dealers/${id}`),
  
  // Vehicle Models
  getVehicleModels: () => api.get('/api/v1/vehicle-models/'),
  getVehicleModel: (id) => api.get(`/api/v1/vehicle-models/${id}`),
  createVehicleModel: (data) => api.post('/api/v1/vehicle-models/', data),
  updateVehicleModel: (id, data) => api.put(`/api/v1/vehicle-models/${id}`, data),
  deleteVehicleModel: (id) => api.delete(`/api/v1/vehicle-models/${id}`),
  
  // Customers
  getCustomers: () => api.get('/api/v1/customers/'),
  createCustomer: (data) => api.post('/api/v1/customers/', data),
  
  // Bookings
  getBookings: () => api.get('/api/v1/bookings/'),
  createBooking: (data) => api.post('/api/v1/bookings/', data),
  updateBooking: (id, data) => api.put(`/api/v1/bookings/${id}`, data),
  
  // Sales
  getSales: () => api.get('/api/v1/sales/'),
  createSale: (data) => api.post('/api/v1/sales/', data),
  getMonthlyReport: (year, month) => api.get('/api/v1/sales/monthly-report', { params: { year, month } }),
 getProfitAnalysis: (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  return api.get('/api/v1/sales/profit-analysis', { params });
},
  // Delivery
  getDeliveries: () => api.get('/api/v1/delivery/'),
  createDelivery: (data) => api.post('/api/v1/delivery/', data),
  updateDelivery: (id, data) => api.put(`/api/v1/delivery/${id}`, data),
  
  // Targets
  getTargets: () => api.get('/api/v1/targets/'),
  createTarget: (data) => api.post('/api/v1/targets/', data),
  getTargetPerformance: (year) => api.get('/api/v1/targets/performance', { params: { year } }),
  
  // Analytics
  getDashboardAnalytics: () => api.get('/api/v1/analytics/dashboard'),
  getStateWiseSales: () => api.get('/api/v1/analytics/state-wise'),
  getCityWiseSales: () => api.get('/api/v1/analytics/city-wise'),
  getTopShowrooms: () => api.get('/api/v1/analytics/top-showrooms'),
  getTopDealers: () => api.get('/api/v1/analytics/top-dealers'),
  getTopModels: () => api.get('/api/v1/analytics/top-models'),
  getMonthlyTrends: (year) => api.get('/api/v1/analytics/monthly-trends', { params: { year } }),
};