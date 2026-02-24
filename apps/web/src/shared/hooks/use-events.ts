'use client';

import { apiClient } from '@/shared/api-client';
import type {
  AttendanceIntentStateResponse,
  CreateRegistrationInput,
  CreateRegistrationResponse,
  PublicEventDetailResponse,
  PublicEventsRequest,
  PublicEventsResponse,
  PublicProgramDetailResponse,
  PublicProgramsRequest,
  PublicProgramsResponse,
  UserRegistrationDetailResponse,
  UserRegistrationsResponse,
} from '@engaje/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function usePublicEvents(params: Partial<PublicEventsRequest> = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return useQuery({
    queryKey: ['public-events', params],
    queryFn: () => apiClient.get<PublicEventsResponse>(`/public/events${queryString}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicEvent(slug: string) {
  return useQuery({
    queryKey: ['public-event', slug],
    queryFn: () => apiClient.get<PublicEventDetailResponse>(`/public/events/${slug}`),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(slug),
  });
}

export function usePublicPrograms(params: Partial<PublicProgramsRequest> = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return useQuery({
    queryKey: ['public-programs', params],
    queryFn: () => apiClient.get<PublicProgramsResponse>(`/public/programs${queryString}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicProgram(slug: string) {
  return useQuery({
    queryKey: ['public-program', slug],
    queryFn: () => apiClient.get<PublicProgramDetailResponse>(`/public/programs/${slug}`),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(slug),
  });
}

export function useUserRegistrations(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['registrations', page, limit],
    queryFn: () =>
      apiClient.get<UserRegistrationsResponse>(`/registrations?page=${page}&limit=${limit}`),
  });
}

export function useUserRegistrationDetail(registrationId: string) {
  return useQuery({
    queryKey: ['registration', registrationId],
    queryFn: () =>
      apiClient.get<UserRegistrationDetailResponse>(`/registrations/${registrationId}`),
    enabled: Boolean(registrationId),
  });
}

export function useCreateRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRegistrationInput | string) => {
      const payload: CreateRegistrationInput =
        typeof input === 'string' ? { eventId: input } : input;
      return apiClient.post<CreateRegistrationResponse>('/registrations', payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['registrations'] });
      void queryClient.invalidateQueries({ queryKey: ['public-events'] });
      void queryClient.invalidateQueries({ queryKey: ['public-event'] });
    },
  });
}

export function useCancelRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/registrations/${id}/cancel`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['registrations'] });
      void queryClient.invalidateQueries({ queryKey: ['registration'] });
    },
  });
}

export function useAttendanceIntentState(eventId: string, enabled = true) {
  return useQuery({
    queryKey: ['attendance-intent', eventId],
    queryFn: () =>
      apiClient.get<AttendanceIntentStateResponse>(`/events/${eventId}/attendance-intents/me`),
    enabled: enabled && Boolean(eventId),
    retry: false,
  });
}

export function useCreateAttendanceIntent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post(`/events/${eventId}/attendance-intents`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendance-intent', eventId] });
      void queryClient.invalidateQueries({ queryKey: ['public-events'] });
      void queryClient.invalidateQueries({ queryKey: ['public-event'] });
    },
  });
}

export function useDeleteAttendanceIntent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.delete(`/events/${eventId}/attendance-intents`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendance-intent', eventId] });
      void queryClient.invalidateQueries({ queryKey: ['public-events'] });
      void queryClient.invalidateQueries({ queryKey: ['public-event'] });
    },
  });
}
