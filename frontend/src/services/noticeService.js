import api from './api';

export const noticeService = {
  getNotices: async () => {
    const res = await api.get('/notices/notices/');
    return res.data;
  },
  createNotice: async (data) => {
    const res = await api.post('/notices/notices/', data);
    return res.data;
  },
  deleteNotice: async (id) => {
    const res = await api.delete(`/notices/notices/${id}/`);
    return res.data;
  },
  updateNotice: async (id, data) => {
    const res = await api.put(`/notices/notices/${id}/`, data);
    return res.data;
  },
};
