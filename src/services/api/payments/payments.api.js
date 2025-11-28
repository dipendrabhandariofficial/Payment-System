import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const paymentsApi = {
    getAll: async () => {
        const response = await apiClient.get(ENDPOINTS.PAYMENTS);
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`${ENDPOINTS.PAYMENTS}/${id}`);
        return response.data;
    },

    getByStudentId: async (studentId) => {
        const response = await apiClient.get(`${ENDPOINTS.PAYMENTS}?studentId=${studentId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post(ENDPOINTS.PAYMENTS, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`${ENDPOINTS.PAYMENTS}/${id}`);
        return response.data;
    },
};
