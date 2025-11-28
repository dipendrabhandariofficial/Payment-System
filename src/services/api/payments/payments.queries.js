import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from './payments.api';
import { QUERY_KEYS } from '../queryKeys';

export const usePayments = (options = {}) => {
    return useQuery({
        queryKey: QUERY_KEYS.payments.all,
        queryFn: paymentsApi.getAll,
        ...options,
    });
};

export const usePayment = (id, options = {}) => {
    return useQuery({
        queryKey: QUERY_KEYS.payments.detail(id),
        queryFn: () => paymentsApi.getById(id),
        enabled: !!id,
        ...options,
    });
};

export const usePaymentsByStudent = (studentId, options = {}) => {
    return useQuery({
        queryKey: QUERY_KEYS.payments.byStudent(studentId),
        queryFn: () => paymentsApi.getByStudentId(studentId),
        enabled: !!studentId,
        ...options,
    });
};
