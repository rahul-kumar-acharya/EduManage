import api from './api';

export const schoolService = {
  checkSubdomain: async (subdomain) => {
    const response = await api.get(`/schools/check-subdomain/?subdomain=${subdomain}`);
    return response.data;
  },

  registerSchool: async (data) => {
    const response = await api.post('/schools/register/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getTenantInfo: async () => {
    const response = await api.get('/schools/tenant-info/');
    return response.data;
  },

  getPublicStats: async () => {
    const response = await api.get('/schools/public-stats/');
    return response.data;
  },
};
