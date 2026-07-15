import api from './api';

// Unwraps the backend's { success, count, total, page, pages, data } envelope
// into the { items, total, page, totalPages, count } shape screens expect.
const unwrapList = (res) => ({
  items: res.data.data,
  total: res.data.total ?? res.data.count ?? 0,
  page: res.data.page ?? 1,
  totalPages: res.data.pages ?? 1,
  count: res.data.count,
});

// Builds a multipart/form-data body from ad fields + picked image assets
// (as returned by expo-image-picker: { uri, fileName, mimeType }).
export const buildProductFormData = (fields, images) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  images.forEach((asset, index) => {
    formData.append('images', {
      uri: asset.uri,
      name: asset.fileName || `photo_${index}.jpg`,
      type: asset.mimeType || 'image/jpeg',
    });
  });
  return formData;
};

const productService = {
  getProducts: (params) => api.get('/products', { params }).then(unwrapList),

  getFeatured: () => api.get('/products/featured').then(unwrapList),

  getRecent: (params) => api.get('/products/recent', { params }).then(unwrapList),

  getRelated: (id) => api.get(`/products/${id}/related`).then(unwrapList),

  getById: (id) => api.get(`/products/${id}`).then((res) => res.data.data),

  search: (params) => api.get('/products/search', { params }).then(unwrapList),

  getByCategory: (categorySlug, params) =>
    api.get(`/products/category/${categorySlug}`, { params }).then((res) => ({
      ...unwrapList(res),
      category: res.data.category,
      ancestors: res.data.ancestors || [],
      subcategories: res.data.subcategories || [],
    })),

  create: (formData) =>
    api
      .post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data.data),

  update: (id, formData) =>
    api
      .put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data.data),

  remove: (id) => api.delete(`/products/${id}`).then((res) => res.data),

  getMyAds: (params) => api.get('/products/my-products', { params }).then(unwrapList),

  markAsSold: (id) => api.patch(`/products/${id}/sold`).then((res) => res.data.data),
};

export default productService;
