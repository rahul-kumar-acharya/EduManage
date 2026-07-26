import api from './api';

export const academicService = {
  // Sessions
  getSessions: async () => {
    const res = await api.get('/academics/sessions/');
    return res.data;
  },
  createSession: async (data) => {
    const res = await api.post('/academics/sessions/', data);
    return res.data;
  },
  setCurrentSession: async (id) => {
    const res = await api.post(`/academics/sessions/${id}/set-current/`);
    return res.data;
  },
  deleteSession: async (id) => {
    const res = await api.delete(`/academics/sessions/${id}/`);
    return res.data;
  },

  // Classes & Sections
  getClasses: async () => {
    const res = await api.get('/academics/classes/');
    return res.data;
  },
  createClass: async (data) => {
    const res = await api.post('/academics/classes/', data);
    return res.data;
  },
  deleteClass: async (id) => {
    const res = await api.delete(`/academics/classes/${id}/`);
    return res.data;
  },
  getSections: async (params) => {
    const res = await api.get('/academics/sections/', { params });
    return res.data;
  },
  createSection: async (data) => {
    const res = await api.post('/academics/sections/', data);
    return res.data;
  },
  deleteSection: async (id) => {
    const res = await api.delete(`/academics/sections/${id}/`);
    return res.data;
  },
  updateSection: async (id, data) => {
    const res = await api.patch(`/academics/sections/${id}/`, data);
    return res.data;
  },

  // Subjects
  getSubjects: async (params) => {
    const res = await api.get('/academics/subjects/', { params });
    return res.data;
  },
  createSubject: async (data) => {
    const res = await api.post('/academics/subjects/', data);
    return res.data;
  },
  deleteSubject: async (id) => {
    const res = await api.delete(`/academics/subjects/${id}/`);
    return res.data;
  },
  updateSubject: async (id, data) => {
    const res = await api.put(`/academics/subjects/${id}/`, data);
    return res.data;
  },
};
