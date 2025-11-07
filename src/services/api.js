import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth APIs
export const login = async (email, password) => {
  const response = await api.get(`/users?email=${email}&password=${password}`);
  console.log("🚀 ~ login ~ response:", response)
  
  return response.data[0];
};

export const register = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Student APIs
export const getStudents = async () => {
  const response = await api.get('/students');
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

export const addStudent = async (studentData) => {
  const response = await api.post('/students', studentData);
  return response.data;
};

export const updateStudent = async (id, studentData) => {
  const response = await api.put(`/students/${id}`, studentData);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

// Payment APIs
export const getPayments = async () => {
  const response = await api.get('/payments');
  return response.data;
};

export const getPaymentsByStudentId = async (studentId) => {
  const response = await api.get(`/payments?studentId=${studentId}`);
  return response.data;
};

export const addPayment = async (paymentData) => {
  const response = await api.post('/payments', paymentData);
  return response.data;
};

export const deletePayment = async (id) => {
  const response = await api.delete(`/payments/${id}`);
  return response.data;
};

export default api;