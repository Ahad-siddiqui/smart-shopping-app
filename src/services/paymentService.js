import api from './api';

// Manual ad-posting fee payment API calls (EasyPaisa / Bank Alfalah,
// verified by an admin - no live payment gateway integration).
const paymentService = {
  getSettings: () => api.get('/payments/settings').then((res) => res.data.data),

  // fields: { productId, method, transactionId }, screenshot: image asset (optional)
  submit: (fields, screenshot) => {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => formData.append(key, String(value)));
    if (screenshot) {
      formData.append('screenshot', {
        uri: screenshot.uri,
        name: screenshot.fileName || 'screenshot.jpg',
        type: screenshot.mimeType || 'image/jpeg',
      });
    }
    return api
      .post('/payments', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data.data);
  },
};

export default paymentService;
