import axios from 'axios';

const api = axios.create({ 
  baseURL: 'http://localhost:8080/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const transactionAPI = {
  getAll: () => api.get('/transactions'),
  add: (data) => api.post('/transactions', data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getSummary: () => api.get('/transactions/summary'),
};