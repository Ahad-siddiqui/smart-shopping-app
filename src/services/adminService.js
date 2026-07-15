import api from './api';

const unwrapList = (res) => ({
  items: res.data.data,
  total: res.data.total ?? res.data.count ?? 0,
  page: res.data.page ?? 1,
  totalPages: res.data.pages ?? 1,
});

// Admin-only management API calls.
const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard').then((res) => res.data.data),

  getUsers: (params) => api.get('/admin/users', { params }).then(unwrapList),
  toggleBanUser: (id) => api.put(`/admin/users/${id}/ban`).then((res) => res.data.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((res) => res.data),

  getPendingAds: (params) => api.get('/admin/products', { params: { ...params, status: 'pending' } }).then(unwrapList),
  approveAd: (id) => api.put(`/admin/products/${id}/approve`).then((res) => res.data.data),
  rejectAd: (id, reason) => api.put(`/admin/products/${id}/reject`, { reason }).then((res) => res.data.data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`).then((res) => res.data),

  getPayments: (params) => api.get('/admin/payments', { params: { ...params, status: 'pending' } }).then(unwrapList),
  verifyPayment: (id) => api.put(`/admin/payments/${id}/verify`).then((res) => res.data.data),
  rejectPayment: (id, reason) => api.put(`/admin/payments/${id}/reject`, { reason }).then((res) => res.data.data),

  getReports: (params) => api.get('/admin/reports', { params }).then(unwrapList),
  resolveReport: (id, data) => api.put(`/admin/reports/${id}`, data).then((res) => res.data.data),
};

export default adminService;
