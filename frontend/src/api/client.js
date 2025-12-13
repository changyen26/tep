import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

client.interceptors.response.use(
  (response) => ({
    data: response.data,
    status: response.status,
    headers: response.headers,
  }),
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    const message = error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject({
      status,
      message,
      data: error.response?.data,
    });
  },
);

export default client;
