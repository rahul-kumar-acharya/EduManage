import api from './api';

export const timetableService = {
  getPeriods: async (params = {}) => {
    const res = await api.get('/timetable/periods/', { params });
    return res.data;
  },
  createPeriod: async (data) => {
    const res = await api.post('/timetable/periods/', data);
    return res.data;
  },
  deletePeriod: async (id) => {
    const res = await api.delete(`/timetable/periods/${id}/`);
    return res.data;
  },
};
