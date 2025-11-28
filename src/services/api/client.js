import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;
const API_CONTENT_TYPE = import.meta.env.VITE_API_CONTENT_TYPE || "application/json";

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": API_CONTENT_TYPE,
    },
    timeout: Number(API_TIMEOUT),
});


// Request interceptor
// apiClient.interceptors.request.use(
//     (config) => {
//         // Add auth token if available
//         const token = localStorage.getItem('authToken');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// Response interceptor
// apiClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         // Handle common errors globally
//         if (error.response?.status === 401) {
//             // Unauthorized - could redirect to login
//             console.error('Unauthorized access');
//         } else if (error.response?.status === 500) {
//             console.error('Server error');
//         }
//         return Promise.reject(error);
//     }
// );
