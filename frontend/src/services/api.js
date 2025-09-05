import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export const sessionsAPI = {
  login: (data) => api.post('/sessions/login', data, { withCredentials: true }),
  logout: () => api.post('/sessions/logout', {}, { withCredentials: true }),
  refresh: () => api.post('/sessions/refresh', {}, { withCredentials: true }),
}

export const notesAPI = {
  getAll: (params = {}) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.patch(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const aiAPI = {
  generateContent: (prompt) => api.post('/ai/generate', { prompt }),
};

export default api;