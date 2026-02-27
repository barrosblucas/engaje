import { generateRegistrationsPdf } from '@/lib/admin-registrations-pdf';
import { API_URL, apiClient } from '@/shared/api-client';
import type {
  AdminEventDetailResponse,
  AdminEventListResponse,
  AdminProgramDetailResponse,
  AdminProgramListResponse,
  AdminRegistration,
  AdminRegistrationsResponse,
  AdminUploadImageResponse,
  CreateEventInput,
  CreateManagedUserInput,
  CreateProgramInput,
  DynamicForm,
  UpdateEventInput,
  UpdateEventStatusInput,
  UpdateProgramInput,
  User,
} from '@engaje/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ─── Admin Events ──────────────────────────────────────────────────────────────

export function useAdminEvents(params: {
  page?: number;
  search?: string;
  status?: string;
  category?: string;
}) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.set('page', String(params.page));
  if (params.search) queryString.set('search', params.search);
  if (params.status) queryString.set('status', params.status);
  if (params.category) queryString.set('category', params.category);

  return useQuery<AdminEventListResponse>({
    queryKey: ['admin', 'events', params],
    queryFn: () => apiClient.get<AdminEventListResponse>(`/admin/events?${queryString.toString()}`),
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

export function useAdminImageUpload() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post<AdminUploadImageResponse>('/admin/uploads/image', formData);
    },
  });
}

// ─── Admin Programs ───────────────────────────────────────────────────────────

export function useAdminPrograms(params: {
  page?: number;
  search?: string;
  status?: string;
  category?: string;
}) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.set('page', String(params.page));
  if (params.search) queryString.set('search', params.search);
  if (params.status) queryString.set('status', params.status);
  if (params.category) queryString.set('category', params.category);

  return useQuery<AdminProgramListResponse>({
    queryKey: ['admin', 'programs', params],
    queryFn: () =>
      apiClient.get<AdminProgramListResponse>(`/admin/programs?${queryString.toString()}`),
  });
}

export function useAdminProgram(id: string) {
  return useQuery<AdminProgramDetailResponse>({
    queryKey: ['admin', 'programs', id],
    queryFn: () => apiClient.get<AdminProgramDetailResponse>(`/admin/programs/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgramInput) => apiClient.post('/admin/programs', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
    },
  });
}

export function useUpdateProgram(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProgramInput) => apiClient.patch(`/admin/programs/${id}`, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
    },
  });
}

export function useSetProgramHomeHighlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isHighlightedOnHome }: { id: string; isHighlightedOnHome: boolean }) =>
      apiClient.patch(`/admin/programs/${id}`, {
        isHighlightedOnHome,
      } satisfies UpdateProgramInput),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
    },
  });
}

// ─── Admin Registrations ───────────────────────────────────────────────────────

export function useAdminRegistrations(
  eventId: string,
  params: { page?: number; limit?: number; search?: string },
) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.set('page', String(params.page));
  if (params.limit) queryString.set('limit', String(params.limit));
  if (params.search) queryString.set('search', params.search);

  return useQuery<AdminRegistrationsResponse>({
    queryKey: ['admin', 'events', eventId, 'registrations', params],
    queryFn: () =>
      apiClient.get<AdminRegistrationsResponse>(
        `/admin/events/${eventId}/registrations?${queryString.toString()}`,
      ),
    enabled: Boolean(eventId),
  });
}

export function useExportRegistrationsCsv(eventId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/v1/admin/events/${eventId}/registrations/export`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `inscricoes-${eventId}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    },
  });
}

interface ExportRegistrationsPdfInput {
  eventTitle: string;
  eventSlug?: string;
  dynamicFormSchema?: DynamicForm | null;
}

async function fetchAllEventRegistrations(eventId: string): Promise<AdminRegistration[]> {
  const pageSize = 200;
  const firstPage = await apiClient.get<AdminRegistrationsResponse>(
    `/admin/events/${eventId}/registrations?page=1&limit=${pageSize}`,
  );

  if (firstPage.meta.totalPages <= 1) {
    return firstPage.data;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.totalPages - 1 }, (_, index) => index + 2).map((page) =>
      apiClient.get<AdminRegistrationsResponse>(
        `/admin/events/${eventId}/registrations?page=${page}&limit=${pageSize}`,
      ),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.data);
}

export function useExportRegistrationsPdf(eventId: string) {
  return useMutation({
    mutationFn: async ({
      eventTitle,
      eventSlug,
      dynamicFormSchema,
    }: ExportRegistrationsPdfInput) => {
      const registrations = await fetchAllEventRegistrations(eventId);
      await generateRegistrationsPdf({
        registrations,
        eventTitle,
        eventSlug,
        dynamicFormSchema,
      });
    },
  });
}

export function useCreateManagedUser() {
  return useMutation({
    mutationFn: (data: CreateManagedUserInput) =>
      apiClient.post<{ user: User }>('/admin/users', data),
  });
}
