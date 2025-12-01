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

apiClient.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            // Turbo Console Log: Show token being attached
            // console.log("🚀 [API Request] Attaching Token:", {
            //     url: config.url,
            //     token: token.substring(0, 20) + "..." // Truncate for readability
            // });
        } else {
            // console.log("⚠️ [API Request] No Token Found for:", config.url);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle common errors globally
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            console.error('Unauthorized access - Redirecting to login');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } else if (error.response?.status === 500) {
            console.error('Server error');
        }
        return Promise.reject(error);
    }
);
