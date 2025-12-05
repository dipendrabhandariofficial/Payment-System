import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useToast } from "@/context";
import { authApi } from "./auth.api";
import type { AuthResponse } from "@/types";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export const useLogin = (): UseMutationResult<
  AuthResponse,
  any,
  LoginCredentials
> => {
  const toast = useToast();

  return useMutation({
    mutationFn: ({ email, password }: LoginCredentials) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      console.log("Login success:", data);
      toast.success("Login successful!");
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials.");
    },
  });
};

export const useRegister = (): UseMutationResult<
  AuthResponse,
  any,
  RegisterData
> => {
  const toast = useToast();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: () => {
      toast.success("Registration successful!");
    },
    onError: (error) => {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    },
  });
};
