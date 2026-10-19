import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to strip undefined/null/empty params before sending
api.interceptors.request.use(
  (config) => {
    if (config.params) {
      const cleanParams = {};
      Object.entries(config.params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          cleanParams[key] = val;
        }
      });
      config.params = cleanParams;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to toast errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An error occurred while communicating with the server';
    toast.error(message);
    return Promise.reject(error);
  }
);

export const getTransactions = (params) =>
  api.get('/api/transactions', { params }).then((r) => r.data);

export const createTransaction = (data) =>
  api.post('/api/transactions', data).then((r) => r.data);

export const updateTransaction = (id, data) =>
  api.put(`/api/transactions/${id}`, data).then((r) => r.data);

export const deleteTransaction = (id) =>
  api.delete(`/api/transactions/${id}`);

export const getSummary = (month) =>
  api.get('/api/summary', { params: { month } }).then((r) => r.data);

export const getMonthlyHistory = (months = 6) =>
  api.get('/api/summary/monthly', { params: { months } }).then((r) => r.data);

export const getBudget = () =>
  api.get('/api/budget').then((r) => r.data);

export const updateBudget = (data) =>
  api.put('/api/budget', data).then((r) => r.data);

export const getCategories = () =>
  api.get('/api/categories').then((r) => r.data);

export const addCategory = (name) =>
  api.post('/api/categories', { name }).then((r) => r.data);

export const seedData = () =>
  api.post('/api/seed').then((r) => r.data);

export const exportCsv = (month) => {
  const url = `http://localhost:8080/api/export/csv${month ? '?month=' + encodeURIComponent(month) : ''}`;
  window.open(url, '_blank');
};

export default api;
