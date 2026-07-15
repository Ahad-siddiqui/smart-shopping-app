import api from './api';

const categoryService = {
  getAll: () =>
    api.get('/categories').then((res) => ({
      items: res.data.data,
      total: res.data.total ?? res.data.count ?? 0,
    })),

  getBySlug: (slug) => api.get(`/categories/${slug}`).then((res) => res.data.data),
};

export default categoryService;
