import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { paymentsApi } from './payments.api';
import { QUERY_KEYS } from '../queryKeys';
import { Payment } from '@types/index';

export const usePayments = (options: Omit<UseQueryOptions<Payment[], Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.payments.all,
    queryFn: paymentsApi.getAll,
    ...options,
  });
};

export const usePayment = (id: string, options: Omit<UseQueryOptions<Payment, Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.payments.detail(id),
    queryFn: () => paymentsApi.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const usePaymentsByStudent = (studentId: string, options: Omit<UseQueryOptions<Payment[], Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.payments.byStudent(studentId),
    queryFn: () => paymentsApi.getByStudentId(studentId),
    enabled: !!studentId,
    ...options,
  });
};
