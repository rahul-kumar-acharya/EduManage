import api from './api';

export const feeService = {
  getStructures: async () => {
    const res = await api.get('/fees/structures/');
    return res.data;
  },
  createStructure: async (data) => {
    const res = await api.post('/fees/structures/', data);
    return res.data;
  },
  deleteStructure: async (id) => {
    const res = await api.delete(`/fees/structures/${id}/`);
    return res.data;
  },
  getPayments: async (params = {}) => {
    const res = await api.get('/fees/payments/', { params });
    return res.data;
  },
  collectFee: async (data) => {
    const res = await api.post('/fees/payments/collect/', data);
    return res.data;
  },
  getDues: async () => {
    const res = await api.get('/fees/payments/dues/');
    return res.data;
  },
};
