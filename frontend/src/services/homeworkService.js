import api from './api';

export const homeworkService = {
  getHomeworks: async (params = {}) => {
    const res = await api.get('/homework/assignments/', { params });
    return res.data;
  },
  createHomework: async (data) => {
    const res = await api.post('/homework/assignments/', data);
    return res.data;
  },
  deleteHomework: async (id) => {
    const res = await api.delete(`/homework/assignments/${id}/`);
    return res.data;
  },
  updateHomework: async (id, data) => {
    const res = await api.put(`/homework/assignments/${id}/`, data);
    return res.data;
  },
};
