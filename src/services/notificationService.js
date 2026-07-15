import api from './api';

const notificationService = {
  getAll: (params) =>
    api.get('/notifications', { params }).then((res) => ({
      items: res.data.data,
      total: res.data.total ?? res.data.count ?? 0,
      unreadCount: res.data.unreadCount ?? 0,
    })),

  markAsRead: (id) => api.put(`/notifications/${id}/read`).then((res) => res.data.data),

  markAllAsRead: () => api.put('/notifications/read-all').then((res) => res.data),

  remove: (id) => api.delete(`/notifications/${id}`).then((res) => res.data),
};

export default notificationService;
