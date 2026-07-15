import api from './api';

const favouriteService = {
  getAll: (params) =>
    api.get('/favourites', { params }).then((res) => ({
      items: res.data.data,
      total: res.data.total ?? res.data.count ?? 0,
    })),

  add: (productId) => api.post(`/favourites/${productId}`).then((res) => res.data.data),

  remove: (productId) => api.delete(`/favourites/${productId}`).then((res) => res.data),
};

export default favouriteService;
