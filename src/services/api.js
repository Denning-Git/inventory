// services/api.js
import axios from 'axios';
// const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const API_BASE = 'http://localhost:5001/api';
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Generic request methods
const request = {
  get: (url, params = {}) => api.get(url, { params }),
  post: (url, data = {}) => api.post(url, data),
  put: (url, data = {}) => api.put(url, data),
  delete: (url) => api.delete(url),
};

export const apiService = {
  // Generic HTTP methods
  ...request,
  
  // Products
  getProducts: (params = {}) => request.get('/products', params),
  getProduct: (id) => request.get(`/products/${id}`),
  createProduct: (data) => request.post('/products', data),
  updateProduct: (id, data) => request.put(`/products/${id}`, data),
  deleteProduct: (id) => request.delete(`/products/${id}`),
  updateStock: (id, data) => request.post(`/products/${id}/stock`, data),

  // Transactions
  getTransactions: (params = {}) => request.get('/transactions', params),

  // Anomalies
  getAnomalies: (params = {}) => request.get('/anomalies', params),
  resolveAnomaly: (id) => request.put(`/anomalies/${id}/resolve`),

  // Alerts
  getAlerts: (params = {}) => request.get('/alerts', params),
  markAlertAsRead: (id) => request.put(`/alerts/${id}/read`),

  // Analytics
  getDashboardAnalytics: () => request.get('/analytics/dashboard'),
  getTheftAnalytics: (params = {}) => request.get('/analytics/theft', params),

  // AI Detection
  triggerAnomalyDetection: () => request.post('/ai/detect-anomalies'),
  triggerTheftDetection: () => request.post('/ai/detect-theft'),

  // Health
  getHealthStatus: () => request.get('/health'),

  // Auth
  usersLogin: (data)=> request.post('/auth/login',data),


  // ReUsables
  getData: (route) => request.get(route),
  sendData: (route,data) => request.post(route,data)

};