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

  getSchoolOverview: async () => {
    const response = await api.get('/reports/overview/');
    const data = response.data;
    if (data && data.overview) {
      return {
        ...data.overview,
        attendance_rate: data.overview.overall_attendance_rate ?? data.overview.attendance_rate ?? 0,
        ...data,
      };
    }
    return data;
  },

  getPublicStats: async () => {
    const response = await api.get('/schools/public-stats/');
    return response.data;
  },

  submitContactForm: async (data) => {
    const response = await api.post('/schools/contact/', data);
    return response.data;
  },
};

