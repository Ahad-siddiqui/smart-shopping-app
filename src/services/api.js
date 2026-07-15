import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, TOKEN_STORAGE_KEY } from '../utils/constants';

// Central Axios instance used by every service module.
const api = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT bearer token (persisted in AsyncStorage) to every request.
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize error messages so screens can just read `err.message`.
// Session expiry (401) is handled by the screens/auth hook, not here,
// since React Native has no window.location to redirect with.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API ERROR:', error?.message, error?.code, error?.config?.url, JSON.stringify(error?.response?.data));
    const fieldError = error?.response?.data?.errors?.[0]?.message;
    const message =
      fieldError ||
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Something went wrong. Please try again.';

    return Promise.reject({ ...error, message, status: error?.response?.status });
  }
);

export default api;
