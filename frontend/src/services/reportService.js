import api from './api';

export const reportService = {
  getOverviewReport: async () => {
    const res = await api.get('/reports/overview/');
    return res.data;
  },
};
