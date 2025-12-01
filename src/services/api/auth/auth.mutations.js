import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth.api';
import { useToast } from '../../../context/ToastContext';

export const useLogin = () => {
    const toast = useToast();

    return useMutation({
        mutationFn: ({ email, password }) => authApi.login(email, password),
        onSuccess: (data) => {
            console.log('Login success:', data);
            toast.success('Login successful!');
        },
        onError: (error) => {
            console.error('Login error:', error);
            toast.error('Login failed. Please check your credentials.');
        },
    });
};

export const useRegister = () => {
    const toast = useToast();

    return useMutation({
        mutationFn: authApi.register,
        onSuccess: () => {
            toast.success('Registration successful!');
        },
        onError: (error) => {
            console.error('Registration error:', error);
            toast.error('Registration failed. Please try again.');
        },
    });
};
