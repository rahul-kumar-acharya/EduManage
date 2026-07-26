import api from './api';

export const studentService = {
  getStudents: async (params = {}) => {
    const res = await api.get('/students/profiles/', { params });
    return res.data;
  },
  createStudent: async (data) => {
    const res = await api.post('/students/profiles/', data);
    return res.data;
  },
  getStudent: async (id) => {
    const res = await api.get(`/students/profiles/${id}/`);
    return res.data;
  },
  deleteStudent: async (id) => {
    const res = await api.delete(`/students/profiles/${id}/`);
    return res.data;
  },
  updateStudent: async (id, data) => {
    const res = await api.put(`/students/profiles/${id}/`, data);
    return res.data;
  },
};
