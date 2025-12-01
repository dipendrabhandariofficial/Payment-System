/**
 * API Configuration and Endpoints
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const ENDPOINTS = {
  // Students
  STUDENTS: '/students',
  STUDENT_DETAIL: (id: string) => `/students/${id}`,

  // Payments
  PAYMENTS: '/payments',
  PAYMENT_DETAIL: (id: string) => `/payments/${id}`,
  PAYMENTS_BY_STUDENT: (studentId: string) => `/payments?studentId=${studentId}`,

  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  USER: '/auth/user',

  // Courses
  COURSES: '/courses',
  COURSE_DETAIL: (id: string) => `/courses/${id}`,
} as const;

export const API_CONFIG = {
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
