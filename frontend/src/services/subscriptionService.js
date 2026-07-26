import api from './api';

export const subscriptionService = {
  getPlans: async () => {
    const res = await api.get('/subscriptions/plans/');
    return res.data;
  },
  getCurrentSubscription: async () => {
    const res = await api.get('/subscriptions/current/');
    return res.data;
  },
  checkoutSubscription: async (planId) => {
    const res = await api.post('/subscriptions/checkout/', { plan_id: planId });
    return res.data;
  },
};
