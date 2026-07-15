import api from './api';

// All authentication-related API calls (same contract as the web app).
const authService = {
  login: (credentials) => api.post('/auth/login', credentials).then((res) => res.data.data),

  register: (data) => api.post('/auth/register', data).then((res) => res.data.data),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((res) => res.data),

  resetPassword: (token, password) =>
    api.put(`/auth/reset-password/${token}`, { password }).then((res) => res.data.data),

  getCurrentUser: () => api.get('/auth/me').then((res) => res.data.data),

  logout: () => api.post('/auth/logout').then((res) => res.data),

  changePassword: (data) => api.put('/auth/change-password', data).then((res) => res.data),
};

export default authService;
