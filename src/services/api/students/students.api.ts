import { StudentFormData } from "@/types/components";
import { apiClient } from "../client";
import { ENDPOINTS } from "../config";
import { Student } from "@/types";

export const studentsApi = {
  getAll: async (): Promise<Student[]> => {
    const response = await apiClient.get<Student[]>(ENDPOINTS.STUDENTS);
    return response.data;
  },

  getById: async (id: string): Promise<Student> => {
    const response = await apiClient.get<Student>(
      `${ENDPOINTS.STUDENTS}/${id}`
    );
    return response.data;
  },

  create: async (data: StudentFormData): Promise<Student> => {
    const response = await apiClient.post<Student>(ENDPOINTS.STUDENTS, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Student>): Promise<Student> => {
    const response = await apiClient.put<Student>(
      `${ENDPOINTS.STUDENTS}/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`${ENDPOINTS.STUDENTS}/${id}`);
    return response.data;
  },
};
