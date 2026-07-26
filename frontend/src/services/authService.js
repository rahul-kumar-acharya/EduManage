import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/accounts/login/', { email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/accounts/me/');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/accounts/logout/');
    return response.data;
  },
  updateProfile: async (data) => {
    const isFormData = data instanceof FormData;
    const response = await api.put('/accounts/me/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  },
};
