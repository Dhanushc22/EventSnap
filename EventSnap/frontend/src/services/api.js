import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Events API
export const eventsAPI = {
  create: (data) => api.post('/events', data),
  getOrganizerEvents: (params) => api.get('/events/organizer', { params }),
  getById: (id) => api.get(`/events/organizer/${id}`),
  getByEventId: (eventId) => api.get(`/events/public/${eventId}`),
  getPublicEvent: (eventId) => api.get(`/events/public/${eventId}`),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// Photos API
export const photosAPI = {
  upload: (eventId, formData) => {
    return api.post(`/photos/upload/${eventId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getEventPhotos: (eventId, params) => api.get(`/photos/event/${eventId}`, { params }),
  getGalleryPhotos: (eventId, params) => api.get(`/photos/gallery/${eventId}`, { params }),
  updateStatus: (photoId, status) => api.put(`/photos/${photoId}/status`, { status }),
  delete: (photoId) => api.delete(`/photos/${photoId}`),
  bulkOperation: (data) => api.post('/photos/bulk', data),
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    Cookies.set('token', token, { expires: 7 });
  } else {
    Cookies.remove('token');
  }
};

export const getAuthToken = () => {
  return Cookies.get('token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export default api;