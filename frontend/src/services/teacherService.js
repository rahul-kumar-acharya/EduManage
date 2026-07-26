import api from './api';

export const teacherService = {
  getTeachers: async () => {
    const res = await api.get('/teachers/profiles/');
    return res.data;
  },
  createTeacher: async (data) => {
    const res = await api.post('/teachers/profiles/', data);
    return res.data;
  },
  getTeacher: async (id) => {
    const res = await api.get(`/teachers/profiles/${id}/`);
    return res.data;
  },
  deleteTeacher: async (id) => {
    const res = await api.delete(`/teachers/profiles/${id}/`);
    return res.data;
  },
  updateTeacher: async (id, data) => {
    const res = await api.patch(`/teachers/profiles/${id}/`, data);
    return res.data;
  },
};
