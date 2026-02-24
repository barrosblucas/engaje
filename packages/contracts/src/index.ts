import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const UserRoleSchema = z.enum(['citizen', 'admin', 'super_admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const EventCategorySchema = z.enum([
  'festa',
  'esporte',
  'civico',
  'saude',
  'cultura',
  'educacao',
]);
export type EventCategory = z.infer<typeof EventCategorySchema>;

export const EventStatusSchema = z.enum(['draft', 'published', 'closed', 'cancelled']);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const RegistrationStatusSchema = z.enum(['confirmed', 'cancelled']);
export type RegistrationStatus = z.infer<typeof RegistrationStatusSchema>;

// ─── User ─────────────────────────────────────────────────────────────────────

/** CPF deve conter exatamente 11 dígitos numéricos (sem formatação). */
export const CpfSchema = z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos numéricos');

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  cpf: z.string().nullable(),
  phone: z.string().nullable(),
  role: UserRoleSchema,
  createdAt: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const RegisterInputSchema = z.object({
  name: z.string().min(2),
  cpf: CpfSchema,
  email: z.string().email(),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(6),
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const RegisterResponseSchema = z.object({
  user: UserSchema,
});
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const LoginInputSchema = z.object({
  /** Pode ser CPF (11 dígitos) ou e-mail. */
  identifier: z.string().min(1),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const LoginResponseSchema = z.object({
  user: UserSchema,
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const MeResponseSchema = z.object({
  user: UserSchema,
});
export type MeResponse = z.infer<typeof MeResponseSchema>;

export const CreateAdminUserInputSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'super_admin']),
});
export type CreateAdminUserInput = z.infer<typeof CreateAdminUserInputSchema>;

// ─── Event ────────────────────────────────────────────────────────────────────

export const EventSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  category: EventCategorySchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  locationName: z.string(),
  bannerUrl: z.string().nullable(),
  bannerAltText: z.string().nullable(),
  /** null = vagas ilimitadas */
  availableSlots: z.number().int().nullable(),
});
export type EventSummary = z.infer<typeof EventSummarySchema>;

export const EventImageSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  altText: z.string(),
  displayOrder: z.number().int(),
});
export type EventImage = z.infer<typeof EventImageSchema>;

export const EventDetailSchema = EventSummarySchema.extend({
  description: z.string(),
  locationAddress: z.string(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  totalSlots: z.number().int().nullable(),
  status: EventStatusSchema,
  images: z.array(EventImageSchema),
  createdAt: z.string().datetime(),
});
export type EventDetail = z.infer<typeof EventDetailSchema>;

// ─── Public Events API ────────────────────────────────────────────────────────

export const PublicEventsRequestSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: EventCategorySchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['date_asc', 'date_desc']).default('date_asc'),
});
export type PublicEventsRequest = z.infer<typeof PublicEventsRequestSchema>;

export const PublicEventsResponseSchema = z.object({
  data: z.array(EventSummarySchema),
  meta: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
});
export type PublicEventsResponse = z.infer<typeof PublicEventsResponseSchema>;

export const PublicEventDetailResponseSchema = z.object({
  data: EventDetailSchema,
});
export type PublicEventDetailResponse = z.infer<typeof PublicEventDetailResponseSchema>;

// ─── Admin Events API ─────────────────────────────────────────────────────────

export const CreateEventInputSchema = z.object({
  title: z.string().min(3).max(200),
  category: EventCategorySchema,
  description: z.string().min(10),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  locationName: z.string().min(2),
  locationAddress: z.string().min(5),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  totalSlots: z.number().int().positive().optional(),
  bannerAltText: z.string().optional(),
  status: EventStatusSchema.optional().default('draft'),
});
export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;

export const UpdateEventInputSchema = CreateEventInputSchema.partial();
export type UpdateEventInput = z.infer<typeof UpdateEventInputSchema>;

export const UpdateEventStatusInputSchema = z.object({
  status: z.enum(['published', 'closed', 'cancelled']),
});
export type UpdateEventStatusInput = z.infer<typeof UpdateEventStatusInputSchema>;

export const AdminEventListRequestSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: EventStatusSchema.optional(),
  category: EventCategorySchema.optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['start_date_asc', 'start_date_desc', 'created_at_desc']).default('created_at_desc'),
});
export type AdminEventListRequest = z.infer<typeof AdminEventListRequestSchema>;

export const AdminEventSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  category: EventCategorySchema,
  status: EventStatusSchema,
  startDate: z.string().datetime(),
  totalSlots: z.number().int().nullable(),
  registeredCount: z.number().int(),
  createdAt: z.string().datetime(),
});
export type AdminEventSummary = z.infer<typeof AdminEventSummarySchema>;

export const AdminEventListResponseSchema = z.object({
  data: z.array(AdminEventSummarySchema),
  meta: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
});
export type AdminEventListResponse = z.infer<typeof AdminEventListResponseSchema>;

export const AdminEventDetailResponseSchema = EventDetailSchema;
export type AdminEventDetailResponse = z.infer<typeof AdminEventDetailResponseSchema>;

// ─── Registrations ────────────────────────────────────────────────────────────

export const CreateRegistrationInputSchema = z.object({
  eventId: z.string().min(1),
});
export type CreateRegistrationInput = z.infer<typeof CreateRegistrationInputSchema>;

export const RegistrationSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  protocolNumber: z.string(),
  status: RegistrationStatusSchema,
  createdAt: z.string().datetime(),
  cancelledAt: z.string().datetime().nullable(),
});
export type Registration = z.infer<typeof RegistrationSchema>;

export const UserRegistrationSchema = z.object({
  id: z.string(),
  protocolNumber: z.string(),
  status: RegistrationStatusSchema,
  createdAt: z.string().datetime(),
  cancelledAt: z.string().datetime().nullable(),
  event: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    locationName: z.string(),
    bannerUrl: z.string().nullable(),
  }),
});
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;

export const UserRegistrationsResponseSchema = z.object({
  data: z.array(UserRegistrationSchema),
  meta: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
});
export type UserRegistrationsResponse = z.infer<typeof UserRegistrationsResponseSchema>;

export const CreateRegistrationResponseSchema = z.object({
  registration: RegistrationSchema,
});
export type CreateRegistrationResponse = z.infer<typeof CreateRegistrationResponseSchema>;

// ─── Admin Registrations ──────────────────────────────────────────────────────

export const AdminRegistrationSchema = z.object({
  id: z.string(),
  protocolNumber: z.string(),
  status: RegistrationStatusSchema,
  createdAt: z.string().datetime(),
  cancelledAt: z.string().datetime().nullable(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    cpf: z.string().nullable(),
    email: z.string(),
    phone: z.string().nullable(),
  }),
});
export type AdminRegistration = z.infer<typeof AdminRegistrationSchema>;

export const AdminRegistrationsRequestSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  status: RegistrationStatusSchema.optional(),
});
export type AdminRegistrationsRequest = z.infer<typeof AdminRegistrationsRequestSchema>;

export const AdminRegistrationsResponseSchema = z.object({
  data: z.array(AdminRegistrationSchema),
  meta: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
});
export type AdminRegistrationsResponse = z.infer<typeof AdminRegistrationsResponseSchema>;

// ─── Error response ───────────────────────────────────────────────────────────

export const ApiErrorSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
