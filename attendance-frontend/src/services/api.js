import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
};

export const studentAPI = {
  getAll: () => api.get('/students'),
  create: (data) => api.post('/students', data),
  getById: (id) => api.get(`/students/${id}`),
  getBySubject: (subjectId) => api.get(`/students/by-subject/${subjectId}`),
};

export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  create: (data) => api.post('/subjects', data),
};

export const attendanceAPI = {
  markAttendance: (data) => api.post('/attendance/mark', data),
  getReport: (params) => api.get('/attendance/report', { params }),
  getAttendanceForDate: (subjectId, date) =>
    api.post('/attendance/for-date', { subject_id: subjectId, date }) 
};


export default api;