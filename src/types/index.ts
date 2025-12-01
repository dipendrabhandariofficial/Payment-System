/**
 * Core type definitions for the Payment System
 */

export interface Course {
  id: string;
  name: string;
  department?: string;
  totalSemesters: number;
  totalFees: number;
  semesterFees?: number;
}

export interface SemesterFee {
  semester: string | number;
  amount: number;
  dueDate: string;
  paid: boolean;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  admissionDate: string;
  courseId: string;
  course: string;
  semester: string | number;
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  semesterFees?: SemesterFee[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'Online' | 'Check' | 'Card';
  courseId?: string;
  course: string;
  semester: string | number;
  receiptNumber: string;
  transactionId?: string;
  referenceNumber?: string;
  bankName?: string;
  remarks?: string;
  status: 'Pending' | 'Completed' | 'Failed';
  createdAt?: string;
  updatedAt?: string;
}

export interface DuePayment extends Payment {
  isOverdue: boolean;
  daysUntilDue: number | null;
  dueAmount: number;
  paidAmount: number;
  totalSemesterFee: number;
  semesterNumber: number;
  currentSemester: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role?: 'admin' | 'staff' | 'user';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success?: boolean;
  message: string;
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta?: PaginationMeta;
}

export type SortOrder = 'asc' | 'desc';
export type FilterType = 'all' | 'overdue' | 'upcoming';
export type PaymentMethod = 'Cash' | 'Online' | 'Check' | 'Card';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed';
export type UserRole = 'admin' | 'staff' | 'user';
