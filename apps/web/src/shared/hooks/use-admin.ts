import { API_URL, apiClient } from '@/shared/api-client';
import type {
  AdminEventDetailResponse,
  AdminEventListResponse,
  AdminRegistrationsResponse,
  CreateEventInput,
  UpdateEventInput,
  UpdateEventStatusInput,
} from '@engaje/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ─── Admin Events ──────────────────────────────────────────────────────────────

export function useAdminEvents(params: {
  page?: number;
  search?: string;
  status?: string;
  category?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  if (params.category) qs.set('category', params.category);

  return useQuery<AdminEventListResponse>({
    queryKey: ['admin', 'events', params],
    queryFn: () => apiClient.get<AdminEventListResponse>(`/admin/events?${qs.toString()}`),
  });
}

export function useAdminEvent(id: string) {
  return useQuery<AdminEventDetailResponse>({
    queryKey: ['admin', 'events', id],
    queryFn: () => apiClient.get<AdminEventDetailResponse>(`/admin/events/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventInput) => apiClient.post('/admin/events', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEventInput) => apiClient.patch(`/admin/events/${id}`, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}

export function useUpdateEventStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEventStatusInput) =>
      apiClient.patch(`/admin/events/${id}/status`, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}

// ─── Admin Registrations ───────────────────────────────────────────────────────

export function useAdminRegistrations(eventId: string, params: { page?: number; search?: string }) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.search) qs.set('search', params.search);

  return useQuery<AdminRegistrationsResponse>({
    queryKey: ['admin', 'events', eventId, 'registrations', params],
    queryFn: () =>
      apiClient.get<AdminRegistrationsResponse>(
        `/admin/events/${eventId}/registrations?${qs.toString()}`,
      ),
    enabled: Boolean(eventId),
  });
}

export function useExportRegistrationsCsv(eventId: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/v1/admin/events/${eventId}/registrations/export`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inscricoes-${eventId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  });
}
