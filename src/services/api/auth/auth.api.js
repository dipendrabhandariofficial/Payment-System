import { apiClient } from '../client';

export const authApi = {
    login: async (email, password) => {
        const response = await apiClient.get(`/users?email=${email}&password=${password}`);
        return response.data[0];
    },

    register: async (userData) => {
        const response = await apiClient.post('/users', userData);
        return response.data;
    },
};
