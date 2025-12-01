import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
// Local ApiError type to avoid missing module declaration
type ApiError = {
  message: string;
  status?: number;
  code?: string;
}

// Create axios instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
      code: error.code,
    };

    return Promise.reject(apiError);
  }
);

export const apiClient = instance;
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse };
