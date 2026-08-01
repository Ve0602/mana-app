import api from './api';

// ── Auth Service ─────────────────────────────────────────────
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  registerCook: async (data) => {
    const res = await api.post('/auth/cook/register', data);
    return res.data;
  },
  registerFoodie: async (data) => {
    const res = await api.post('/auth/foodie/register', data);
    return res.data;
  },
};

// ── Cook Service ─────────────────────────────────────────────
export const cookService = {
  getAll: async () => {
    const res = await api.get('/cooks');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/cooks/${id}`);
    return res.data;
  },
  getByCity: async (city) => {
    const res = await api.get(`/cooks?city=${city}`);
    return res.data;
  },
  getTopRated: async () => {
    const res = await api.get('/cooks/top-rated');
    return res.data;
  },
  updateProfile: async (id, data) => {
    const res = await api.put(`/cooks/${id}`, data);
    return res.data;
  },
  toggleAvailability: async (id) => {
    const res = await api.patch(`/cooks/${id}/availability`);
    return res.data;
  },
  updateMood: async (id, mood) => {
    const res = await api.patch(`/cooks/${id}/mood`, { mood });
    return res.data;
  },
  uploadProfileImage: async (id, file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post(`/cooks/${id}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

// ── Dish Service ─────────────────────────────────────────────
export const dishService = {
  getByCook: async (cookId) => {
    const res = await api.get(`/dishes/cook/${cookId}`);
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/dishes/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/dishes', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/dishes/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/dishes/${id}`);
    return res.data;
  },
  toggleAvailability: async (id) => {
    const res = await api.patch(`/dishes/${id}/availability`);
    return res.data;
  },
  uploadImage: async (id, file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post(`/dishes/${id}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  search: async (query) => {
    const res = await api.get(`/dishes/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },
  getByHealthTag: async (tag) => {
    const res = await api.get(`/dishes/health/${tag}`);
    return res.data;
  },
};

// ── Order Service ─────────────────────────────────────────────
export const orderService = {
  place: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  getMyOrders: async () => {
    const res = await api.get('/orders/my-orders');
    return res.data;
  },
  getActiveOrders: async () => {
    const res = await api.get('/orders/active');
    return res.data;
  },
  getCookOrders: async () => {
    const res = await api.get('/orders/cook/queue');
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/orders/${id}/status`, { status });
    return res.data;
  },
  cancel: async (id) => {
    const res = await api.patch(`/orders/${id}/cancel`);
    return res.data;
  },
  rateOrder: async (id, rating, review) => {
    const res = await api.post(`/orders/${id}/rate`, { rating, review });
    return res.data;
  },
};

// ── AI Service ───────────────────────────────────────────────
export const aiService = {
  matchCooks: async (healthGoal, preferences) => {
    const res = await api.post('/ai/match-cooks', { healthGoal, preferences });
    return res.data;
  },
  smartSearch: async (query, location) => {
    const res = await api.post('/ai/search', { query, location });
    return res.data;
  },
  getNutritionInfo: async (dishId) => {
    const res = await api.get(`/ai/nutrition/${dishId}`);
    return res.data;
  },
  getMealPlan: async (goal, days) => {
    const res = await api.post('/ai/meal-plan', { goal, days });
    return res.data;
  },
};

// ── Search Service ───────────────────────────────────────────
export const searchService = {
  search: async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    const res = await api.get(`/search?${params}`);
    return res.data;
  },
};
