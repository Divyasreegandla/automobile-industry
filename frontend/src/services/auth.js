import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/api/v1/auth/login', credentials);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },
};