import api from './api';

const savedSearchService = {
  getAll: (params) =>
    api.get('/saved-searches', { params }).then((res) => ({
      items: res.data.data,
      total: res.data.total ?? res.data.count ?? 0,
    })),

  create: (data) => api.post('/saved-searches', data).then((res) => res.data.data),

  remove: (id) => api.delete(`/saved-searches/${id}`).then((res) => res.data),
};

export default savedSearchService;
