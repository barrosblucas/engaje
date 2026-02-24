'use client';

import { apiClient } from '@/shared/api-client';
import type {
  CreateRegistrationResponse,
  PublicEventDetailResponse,
  PublicEventsRequest,
  PublicEventsResponse,
  UserRegistrationsResponse,
} from '@engaje/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function usePublicEvents(params: Partial<PublicEventsRequest> = {}) {
  const searchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      searchParams.set(k, String(v));
    }
  }
  const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return useQuery({
    queryKey: ['public-events', params],
    queryFn: () => apiClient.get<PublicEventsResponse>(`/public/events${qs}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicEvent(slug: string) {
  return useQuery({
    queryKey: ['public-event', slug],
    queryFn: () => apiClient.get<PublicEventDetailResponse>(`/public/events/${slug}`),
    staleTime: 5 * 60 * 1000,
    enabled: !!slug,
  });
}

export function useUserRegistrations(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['registrations', page, limit],
    queryFn: () =>
      apiClient.get<UserRegistrationsResponse>(`/registrations?page=${page}&limit=${limit}`),
  });
}

export function useCreateRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      apiClient.post<CreateRegistrationResponse>('/registrations', { eventId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['public-events'] });
    },
  });
}

export function useCancelRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/registrations/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
  });
}
