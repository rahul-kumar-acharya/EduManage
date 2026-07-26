import api from './api';

export const attendanceService = {
  getAttendance: async (params = {}) => {
    const res = await api.get('/attendance/records/', { params });
    return res.data;
  },
  bulkMarkAttendance: async (data) => {
    const res = await api.post('/attendance/records/bulk-mark/', data);
    return res.data;
  },
};
