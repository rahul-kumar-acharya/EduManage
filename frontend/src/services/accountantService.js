import api from './api';

export const accountantService = {
  getAccountants: async () => {
    const res = await api.get('/accountants/profiles/');
    return res.data;
  },
  createAccountant: async (data) => {
    const res = await api.post('/accountants/profiles/', data);
    return res.data;
  },
  getAccountant: async (id) => {
    const res = await api.get(`/accountants/profiles/${id}/`);
    return res.data;
  },
  updateAccountant: async (id, data) => {
    const res = await api.patch(`/accountants/profiles/${id}/`, data);
    return res.data;
  },
  deleteAccountant: async (id) => {
    const res = await api.delete(`/accountants/profiles/${id}/`);
    return res.data;
  },
};
