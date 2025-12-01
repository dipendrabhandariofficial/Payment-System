import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { paymentsApi } from './payments.api';
import { QUERY_KEYS } from '../queryKeys';
import { useToast } from '../../../context/ToastContext';
import { Payment, ApiResponse, ApiError } from '@types/index';

export const useCreatePayment = (options?: Omit<UseMutationOptions<Payment, ApiError, Partial<Payment>>, 'mutationFn'>) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
      toast.success('Payment added successfully!');
    },
    onError: (error: ApiError) => {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment. Please try again.');
    },
    ...options,
  });
};

export const useDeletePayment = (options?: Omit<UseMutationOptions<ApiResponse, ApiError, string>, 'mutationFn'>) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: paymentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
      toast.success('Payment deleted successfully');
    },
    onError: (error: ApiError) => {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment. Please try again.');
    },
    ...options,
  });
};
