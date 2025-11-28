import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from './payments.api';
import { QUERY_KEYS } from '../queryKeys';
import { useToast } from '../../../context/ToastContext';

export const useCreatePayment = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: paymentsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
            toast.success('Payment added successfully!');
        },
        onError: (error) => {
            console.error('Error adding payment:', error);
            toast.error('Failed to add payment. Please try again.');
        },
    });
};

export const useDeletePayment = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: paymentsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
            toast.success('Payment deleted successfully');
        },
        onError: (error) => {
            console.error('Error deleting payment:', error);
            toast.error('Failed to delete payment. Please try again.');
        },
    });
};
