export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL,
    TIMEOUT: import.meta.env.VITE_API_TIMEOUT,
    RETRY_ATTEMPTS: import.meta.env.VITE_API_RETRY_ATTEMPTS,
};

export const ENDPOINTS = {
    STUDENTS: '/students',
    PAYMENTS: '/payments',
    USERS: '/users',
    COURSES: '/courses',
};
