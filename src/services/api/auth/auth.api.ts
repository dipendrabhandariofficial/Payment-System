import { AuthResponse, User } from "@/types";
import { apiClient } from "../client";
import { ENDPOINTS } from "../config";



interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Query users endpoint to find matching credentials
    const response = await apiClient.get<User[]>('/users');
    const user = response.data.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Generate a simple token
    const token = btoa(JSON.stringify({ userId: user.id, email: user.email }));

    return {
      user,
      token,
      message: 'Login successful',
    };
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'user',
    };

    const response = await apiClient.post<User>('/users', newUser);
    const token = btoa(JSON.stringify({ userId: response.data.id, email: response.data.email }));

    return {
      user: response.data,
      token,
      message: 'Registration successful',
    };
  },

  logout: async (): Promise<void> => {
    // Clear local storage handled by context
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>(ENDPOINTS.USER);
    return response.data;
  },
};
