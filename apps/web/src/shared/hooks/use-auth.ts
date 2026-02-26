'use client';

import { apiClient } from '@/shared/api-client';
import type {
  ChangePasswordInput,
  LoginInput,
  LoginResponse,
  MeResponse,
  RegisterInput,
  RegisterResponse,
  RequestPasswordResetInput,
  RequestPasswordResetResponse,
  ResetPasswordInput,
  UpdateProfileInput,
  UpdateProfileResponse,
} from '@engaje/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => apiClient.get<MeResponse>('/auth/me'),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => apiClient.post<LoginResponse>('/auth/login', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => apiClient.post<RegisterResponse>('/auth/register', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      apiClient.patch<UpdateProfileResponse>('/auth/profile', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => apiClient.patch('/auth/password', input),
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (input: RequestPasswordResetInput) =>
      apiClient.post<RequestPasswordResetResponse>('/auth/password/forgot', input),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => apiClient.post('/auth/password/reset', input),
  });
}
