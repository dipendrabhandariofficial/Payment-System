import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import { Payment, ApiResponse } from '@types/index';

export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    const response = await apiClient.get(ENDPOINTS.PAYMENTS);
    return response.data;
  },

  getById: async (id: string): Promise<Payment> => {
    const response = await apiClient.get(`${ENDPOINTS.PAYMENTS}/${id}`);
    return response.data;
  },

  getByStudentId: async (studentId: string): Promise<Payment[]> => {
    const response = await apiClient.get(`${ENDPOINTS.PAYMENTS}?studentId=${studentId}`);
    return response.data;
  },

  create: async (data: Partial<Payment>): Promise<Payment> => {
    const response = await apiClient.post(ENDPOINTS.PAYMENTS, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`${ENDPOINTS.PAYMENTS}/${id}`);
    return response.data;
  },
};
