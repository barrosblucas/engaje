Object.defineProperty(exports, '__esModule', { value: true });
exports.ApiErrorSchema =
  exports.AdminRegistrationsResponseSchema =
  exports.AdminRegistrationsRequestSchema =
  exports.AdminRegistrationSchema =
  exports.CreateRegistrationResponseSchema =
  exports.UserRegistrationsResponseSchema =
  exports.UserRegistrationSchema =
  exports.RegistrationSchema =
  exports.CreateRegistrationInputSchema =
  exports.AdminEventListResponseSchema =
  exports.AdminEventSummarySchema =
  exports.AdminEventListRequestSchema =
  exports.UpdateEventStatusInputSchema =
  exports.UpdateEventInputSchema =
  exports.CreateEventInputSchema =
  exports.PublicEventDetailResponseSchema =
  exports.PublicEventsResponseSchema =
  exports.PublicEventsRequestSchema =
  exports.EventDetailSchema =
  exports.EventImageSchema =
  exports.EventSummarySchema =
  exports.CreateAdminUserInputSchema =
  exports.MeResponseSchema =
  exports.LoginResponseSchema =
  exports.LoginInputSchema =
  exports.RegisterResponseSchema =
  exports.RegisterInputSchema =
  exports.UserSchema =
  exports.CpfSchema =
  exports.RegistrationStatusSchema =
  exports.EventStatusSchema =
  exports.EventCategorySchema =
  exports.UserRoleSchema =
    void 0;
const zod_1 = require('zod');
// ─── Enums ────────────────────────────────────────────────────────────────────
exports.UserRoleSchema = zod_1.z.enum(['citizen', 'admin', 'super_admin']);
exports.EventCategorySchema = zod_1.z.enum([
  'festa',
  'esporte',
  'civico',
  'saude',
  'cultura',
  'educacao',
]);
exports.EventStatusSchema = zod_1.z.enum(['draft', 'published', 'closed', 'cancelled']);
exports.RegistrationStatusSchema = zod_1.z.enum(['confirmed', 'cancelled']);
// ─── User ─────────────────────────────────────────────────────────────────────
/** CPF deve conter exatamente 11 dígitos numéricos (sem formatação). */
exports.CpfSchema = zod_1.z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos numéricos');
exports.UserSchema = zod_1.z.object({
  id: zod_1.z.string(),
  name: zod_1.z.string(),
  email: zod_1.z.string().email(),
  cpf: zod_1.z.string().nullable(),
  phone: zod_1.z.string().nullable(),
  role: exports.UserRoleSchema,
  createdAt: zod_1.z.string().datetime(),
});
// ─── Auth ─────────────────────────────────────────────────────────────────────
exports.RegisterInputSchema = zod_1.z.object({
  name: zod_1.z.string().min(2),
  cpf: exports.CpfSchema,
  email: zod_1.z.string().email(),
  phone: zod_1.z.string().min(10).max(15).optional(),
  password: zod_1.z.string().min(6),
});
exports.RegisterResponseSchema = zod_1.z.object({
  user: exports.UserSchema,
});
exports.LoginInputSchema = zod_1.z.object({
  /** Pode ser CPF (11 dígitos) ou e-mail. */
  identifier: zod_1.z.string().min(1),
  password: zod_1.z.string().min(1),
});
exports.LoginResponseSchema = zod_1.z.object({
  user: exports.UserSchema,
});
exports.MeResponseSchema = zod_1.z.object({
  user: exports.UserSchema,
});
exports.CreateAdminUserInputSchema = zod_1.z.object({
  name: zod_1.z.string().min(2),
  email: zod_1.z.string().email(),
  password: zod_1.z.string().min(8),
  role: zod_1.z.enum(['admin', 'super_admin']),
});
// ─── Event ────────────────────────────────────────────────────────────────────
exports.EventSummarySchema = zod_1.z.object({
  id: zod_1.z.string(),
  title: zod_1.z.string(),
  slug: zod_1.z.string(),
  category: exports.EventCategorySchema,
  startDate: zod_1.z.string().datetime(),
  endDate: zod_1.z.string().datetime().optional(),
  locationName: zod_1.z.string(),
  bannerUrl: zod_1.z.string().nullable(),
  bannerAltText: zod_1.z.string().nullable(),
  /** null = vagas ilimitadas */
  availableSlots: zod_1.z.number().int().nullable(),
});
exports.EventImageSchema = zod_1.z.object({
  id: zod_1.z.string(),
  imageUrl: zod_1.z.string(),
  altText: zod_1.z.string(),
  displayOrder: zod_1.z.number().int(),
});
exports.EventDetailSchema = exports.EventSummarySchema.extend({
  description: zod_1.z.string(),
  locationAddress: zod_1.z.string(),
  locationLat: zod_1.z.number().nullable(),
  locationLng: zod_1.z.number().nullable(),
  totalSlots: zod_1.z.number().int().nullable(),
  status: exports.EventStatusSchema,
  images: zod_1.z.array(exports.EventImageSchema),
  createdAt: zod_1.z.string().datetime(),
});
// ─── Public Events API ────────────────────────────────────────────────────────
exports.PublicEventsRequestSchema = zod_1.z.object({
  page: zod_1.z.coerce.number().int().min(1).default(1),
  limit: zod_1.z.coerce.number().int().min(1).max(50).default(12),
  category: exports.EventCategorySchema.optional(),
  startDate: zod_1.z.string().datetime().optional(),
  endDate: zod_1.z.string().datetime().optional(),
  search: zod_1.z.string().max(200).optional(),
  sort: zod_1.z.enum(['date_asc', 'date_desc']).default('date_asc'),
});
exports.PublicEventsResponseSchema = zod_1.z.object({
  data: zod_1.z.array(exports.EventSummarySchema),
  meta: zod_1.z.object({
    page: zod_1.z.number().int(),
    limit: zod_1.z.number().int(),
    total: zod_1.z.number().int(),
    totalPages: zod_1.z.number().int(),
  }),
});
exports.PublicEventDetailResponseSchema = zod_1.z.object({
  data: exports.EventDetailSchema,
});
// ─── Admin Events API ─────────────────────────────────────────────────────────
exports.CreateEventInputSchema = zod_1.z.object({
  title: zod_1.z.string().min(3).max(200),
  category: exports.EventCategorySchema,
  description: zod_1.z.string().min(10),
  startDate: zod_1.z.string().datetime(),
  endDate: zod_1.z.string().datetime(),
  locationName: zod_1.z.string().min(2),
  locationAddress: zod_1.z.string().min(5),
  locationLat: zod_1.z.number().optional(),
  locationLng: zod_1.z.number().optional(),
  totalSlots: zod_1.z.number().int().positive().optional(),
  bannerAltText: zod_1.z.string().optional(),
  status: exports.EventStatusSchema.optional().default('draft'),
});
exports.UpdateEventInputSchema = exports.CreateEventInputSchema.partial();
exports.UpdateEventStatusInputSchema = zod_1.z.object({
  status: zod_1.z.enum(['published', 'closed', 'cancelled']),
});
exports.AdminEventListRequestSchema = zod_1.z.object({
  page: zod_1.z.coerce.number().int().min(1).default(1),
  limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
  status: exports.EventStatusSchema.optional(),
  category: exports.EventCategorySchema.optional(),
  search: zod_1.z.string().max(200).optional(),
  sort: zod_1.z
    .enum(['start_date_asc', 'start_date_desc', 'created_at_desc'])
    .default('created_at_desc'),
});
exports.AdminEventSummarySchema = zod_1.z.object({
  id: zod_1.z.string(),
  title: zod_1.z.string(),
  slug: zod_1.z.string(),
  category: exports.EventCategorySchema,
  status: exports.EventStatusSchema,
  startDate: zod_1.z.string().datetime(),
  totalSlots: zod_1.z.number().int().nullable(),
  registeredCount: zod_1.z.number().int(),
  createdAt: zod_1.z.string().datetime(),
});
exports.AdminEventListResponseSchema = zod_1.z.object({
  data: zod_1.z.array(exports.AdminEventSummarySchema),
  meta: zod_1.z.object({
    page: zod_1.z.number().int(),
    limit: zod_1.z.number().int(),
    total: zod_1.z.number().int(),
    totalPages: zod_1.z.number().int(),
  }),
});
// ─── Registrations ────────────────────────────────────────────────────────────
exports.CreateRegistrationInputSchema = zod_1.z.object({
  eventId: zod_1.z.string().min(1),
});
exports.RegistrationSchema = zod_1.z.object({
  id: zod_1.z.string(),
  eventId: zod_1.z.string(),
  userId: zod_1.z.string(),
  protocolNumber: zod_1.z.string(),
  status: exports.RegistrationStatusSchema,
  createdAt: zod_1.z.string().datetime(),
  cancelledAt: zod_1.z.string().datetime().nullable(),
});
exports.UserRegistrationSchema = zod_1.z.object({
  id: zod_1.z.string(),
  protocolNumber: zod_1.z.string(),
  status: exports.RegistrationStatusSchema,
  createdAt: zod_1.z.string().datetime(),
  cancelledAt: zod_1.z.string().datetime().nullable(),
  event: zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    slug: zod_1.z.string(),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime().optional(),
    locationName: zod_1.z.string(),
    bannerUrl: zod_1.z.string().nullable(),
  }),
});
exports.UserRegistrationsResponseSchema = zod_1.z.object({
  data: zod_1.z.array(exports.UserRegistrationSchema),
  meta: zod_1.z.object({
    page: zod_1.z.number().int(),
    limit: zod_1.z.number().int(),
    total: zod_1.z.number().int(),
    totalPages: zod_1.z.number().int(),
  }),
});
exports.CreateRegistrationResponseSchema = zod_1.z.object({
  registration: exports.RegistrationSchema,
});
// ─── Admin Registrations ──────────────────────────────────────────────────────
exports.AdminRegistrationSchema = zod_1.z.object({
  id: zod_1.z.string(),
  protocolNumber: zod_1.z.string(),
  status: exports.RegistrationStatusSchema,
  createdAt: zod_1.z.string().datetime(),
  cancelledAt: zod_1.z.string().datetime().nullable(),
  user: zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    cpf: zod_1.z.string().nullable(),
    email: zod_1.z.string(),
    phone: zod_1.z.string().nullable(),
  }),
});
exports.AdminRegistrationsRequestSchema = zod_1.z.object({
  page: zod_1.z.coerce.number().int().min(1).default(1),
  limit: zod_1.z.coerce.number().int().min(1).max(200).default(50),
  status: exports.RegistrationStatusSchema.optional(),
});
exports.AdminRegistrationsResponseSchema = zod_1.z.object({
  data: zod_1.z.array(exports.AdminRegistrationSchema),
  meta: zod_1.z.object({
    page: zod_1.z.number().int(),
    limit: zod_1.z.number().int(),
    total: zod_1.z.number().int(),
    totalPages: zod_1.z.number().int(),
  }),
});
// ─── Error response ───────────────────────────────────────────────────────────
exports.ApiErrorSchema = zod_1.z.object({
  statusCode: zod_1.z.number(),
  error: zod_1.z.string(),
  message: zod_1.z.string(),
});
//# sourceMappingURL=index.js.map
