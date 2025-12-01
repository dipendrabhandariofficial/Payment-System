import { generateMockToken } from '../../../utils/mockAuth';
import { apiClient } from '../client';

export const authApi = {
    login: async (email, password) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const response = await apiClient.get('/users');
            const users = response.data;
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                const { password: _, ...userWithoutPassword } = user;
                const token = generateMockToken(userWithoutPassword);
                return {
                    user: userWithoutPassword,
                    token
                };
            }
            throw new Error('Invalid credentials');
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },

    register: async (userData) => {
        const response = await apiClient.post('/users', userData);
        return response.data;
    },
};
