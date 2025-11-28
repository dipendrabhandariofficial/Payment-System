import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const studentsApi = {
    getAll: async () => {
        const response = await apiClient.get(ENDPOINTS.STUDENTS);
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`${ENDPOINTS.STUDENTS}/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post(ENDPOINTS.STUDENTS, data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`${ENDPOINTS.STUDENTS}/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`${ENDPOINTS.STUDENTS}/${id}`);
        return response.data;
    },
};
