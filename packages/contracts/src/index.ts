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

export const ProgramStatusSchema = z.enum(['draft', 'published', 'closed', 'cancelled']);
export type ProgramStatus = z.infer<typeof ProgramStatusSchema>;

export const RegistrationStatusSchema = z.enum(['confirmed', 'cancelled']);
export type RegistrationStatus = z.infer<typeof RegistrationStatusSchema>;

export const ProgramRegistrationStatusSchema = z.enum(['confirmed', 'cancelled']);
export type ProgramRegistrationStatus = z.infer<typeof ProgramRegistrationStatusSchema>;

export const RegistrationModeSchema = z.enum(['registration', 'informative']);
export type RegistrationMode = z.infer<typeof RegistrationModeSchema>;

export const DynamicFormFieldTypeSchema = z.enum([
  'short_text',
  'paragraph',
  'number',
  'single_select',
  'multi_select',
  'checkbox',
  'date',
  'terms',
]);
export type DynamicFormFieldType = z.infer<typeof DynamicFormFieldTypeSchema>;

// ─── Dynamic form ─────────────────────────────────────────────────────────────

export const DynamicFormFieldOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});
export type DynamicFormFieldOption = z.infer<typeof DynamicFormFieldOptionSchema>;

export const DynamicFormFieldValidationSchema = z
  .object({
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(1).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().min(1).optional(),
  })
  .superRefine((validation, ctx) => {
    if (
      validation.minLength !== undefined &&
      validation.maxLength !== undefined &&
      validation.minLength > validation.maxLength
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['minLength'],
        message: 'minLength não pode ser maior que maxLength',
      });
    }

    if (
      validation.min !== undefined &&
      validation.max !== undefined &&
      validation.min > validation.max
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['min'],
        message: 'min não pode ser maior que max',
      });
    }
  });
export type DynamicFormFieldValidation = z.infer<typeof DynamicFormFieldValidationSchema>;

export const DynamicFormFieldSchema = z
  .object({
    id: z.string().min(1),
    type: DynamicFormFieldTypeSchema,
    label: z.string().min(1),
    required: z.boolean().default(false),
    placeholder: z.string().max(160).optional(),
    helpText: z.string().max(280).optional(),
    options: z.array(DynamicFormFieldOptionSchema).min(1).optional(),
    validation: DynamicFormFieldValidationSchema.optional(),
  })
  .superRefine((field, ctx) => {
    const needsOptions = field.type === 'single_select' || field.type === 'multi_select';

    if (needsOptions && (!field.options || field.options.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'Campos de seleção precisam de opções',
      });
    }

    if (!needsOptions && field.options && field.options.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'Opções só são permitidas para campos de seleção',
      });
    }
  });
export type DynamicFormField = z.infer<typeof DynamicFormFieldSchema>;

export const DynamicFormSchema = z
  .object({
    fields: z.array(DynamicFormFieldSchema),
  })
  .superRefine((schema, ctx) => {
    const ids = new Set<string>();

    for (const field of schema.fields) {
      if (ids.has(field.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fields'],
          message: `Campo duplicado no formulário: ${field.id}`,
        });
      }
      ids.add(field.id);
    }
  });
export type DynamicForm = z.infer<typeof DynamicFormSchema>;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export const UploadedImageUrlSchema = z
  .string()
  .min(1)
  .max(500)
  .refine((value) => value.startsWith('/uploads/') || isHttpUrl(value), {
    message: 'URL de imagem inválida',
  });
export type UploadedImageUrl = z.infer<typeof UploadedImageUrlSchema>;

function validateExternalCtaCreate(
  input: { externalCtaLabel?: string; externalCtaUrl?: string },
  ctx: z.RefinementCtx,
): void {
  const hasLabel = Boolean(input.externalCtaLabel);
  const hasUrl = Boolean(input.externalCtaUrl);

  if (hasLabel !== hasUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: hasLabel ? ['externalCtaUrl'] : ['externalCtaLabel'],
      message: 'CTA externo exige label e URL juntos',
    });
  }
}

function validateExternalCtaUpdate(
  input: { externalCtaLabel?: string | null; externalCtaUrl?: string | null },
  ctx: z.RefinementCtx,
): void {
  const touched = input.externalCtaLabel !== undefined || input.externalCtaUrl !== undefined;
  if (!touched) return;

  const hasLabel = typeof input.externalCtaLabel === 'string' && input.externalCtaLabel.length > 0;
  const hasUrl = typeof input.externalCtaUrl === 'string' && input.externalCtaUrl.length > 0;
  const clearLabel = input.externalCtaLabel === null;
  const clearUrl = input.externalCtaUrl === null;

  if ((hasLabel && !hasUrl) || (hasUrl && !hasLabel)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: hasLabel ? ['externalCtaUrl'] : ['externalCtaLabel'],
      message: 'CTA externo exige label e URL juntos',
    });
  }

  if ((clearLabel && !clearUrl) || (clearUrl && !clearLabel)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: clearLabel ? ['externalCtaUrl'] : ['externalCtaLabel'],
      message: 'Limpeza do CTA externo exige label e URL juntos',
    });
  }
}

function validateRegistrationModeForCreate(
  input: { registrationMode: RegistrationMode; dynamicFormSchema?: DynamicForm },
  ctx: z.RefinementCtx,
): void {
  if (input.registrationMode === 'registration') {
    if (!input.dynamicFormSchema || input.dynamicFormSchema.fields.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dynamicFormSchema'],
        message: 'Modo registration exige formulário dinâmico válido',
      });
    }
  }

  if (
    input.registrationMode === 'informative' &&
    input.dynamicFormSchema &&
    input.dynamicFormSchema.fields.length > 0
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['dynamicFormSchema'],
      message: 'Modo informative não deve receber formulário dinâmico',
    });
  }
}

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
  registrationMode: RegistrationModeSchema,
  externalCtaLabel: z.string().nullable(),
  externalCtaUrl: z.string().nullable(),
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
  dynamicFormSchema: DynamicFormSchema.nullable(),
  attendanceIntentCount: z.number().int().nonnegative(),
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

export const CreateEventInputSchema = z
  .object({
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
    bannerUrl: UploadedImageUrlSchema.optional(),
    bannerAltText: z.string().optional(),
    registrationMode: RegistrationModeSchema.default('registration'),
    externalCtaLabel: z.string().min(2).max(120).optional(),
    externalCtaUrl: z.string().url('URL externa inválida').optional(),
    dynamicFormSchema: DynamicFormSchema.optional(),
    status: EventStatusSchema.optional().default('draft'),
  })
  .superRefine((input, ctx) => {
    validateExternalCtaCreate(input, ctx);
    validateRegistrationModeForCreate(input, ctx);
  });
export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;

export const UpdateEventInputSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    category: EventCategorySchema.optional(),
    description: z.string().min(10).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    locationName: z.string().min(2).optional(),
    locationAddress: z.string().min(5).optional(),
    locationLat: z.number().nullable().optional(),
    locationLng: z.number().nullable().optional(),
    totalSlots: z.number().int().positive().nullable().optional(),
    bannerUrl: UploadedImageUrlSchema.nullable().optional(),
    bannerAltText: z.string().nullable().optional(),
    registrationMode: RegistrationModeSchema.optional(),
    externalCtaLabel: z.string().min(2).max(120).nullable().optional(),
    externalCtaUrl: z.string().url('URL externa inválida').nullable().optional(),
    dynamicFormSchema: DynamicFormSchema.nullable().optional(),
    status: EventStatusSchema.optional(),
  })
  .superRefine((input, ctx) => {
    validateExternalCtaUpdate(input, ctx);
  });
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
  registrationMode: RegistrationModeSchema,
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

export const AdminUploadImageResponseSchema = z.object({
  url: UploadedImageUrlSchema,
  mimeType: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export type AdminUploadImageResponse = z.infer<typeof AdminUploadImageResponseSchema>;

// ─── Program ──────────────────────────────────────────────────────────────────

export const ProgramSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  category: EventCategorySchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  bannerUrl: z.string().nullable(),
  bannerAltText: z.string().nullable(),
  availableSlots: z.number().int().nullable(),
  registrationMode: RegistrationModeSchema,
  externalCtaLabel: z.string().nullable(),
  externalCtaUrl: z.string().nullable(),
});
export type ProgramSummary = z.infer<typeof ProgramSummarySchema>;

export const ProgramDetailSchema = ProgramSummarySchema.extend({
  description: z.string(),
  totalSlots: z.number().int().nullable(),
  status: ProgramStatusSchema,
  dynamicFormSchema: DynamicFormSchema.nullable(),
  createdAt: z.string().datetime(),
});
export type ProgramDetail = z.infer<typeof ProgramDetailSchema>;

export const CreateProgramInputSchema = z
  .object({
    title: z.string().min(3).max(200),
    category: EventCategorySchema,
    description: z.string().min(10),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    totalSlots: z.number().int().positive().optional(),
    bannerUrl: UploadedImageUrlSchema.optional(),
    bannerAltText: z.string().optional(),
    registrationMode: RegistrationModeSchema.default('registration'),
    externalCtaLabel: z.string().min(2).max(120).optional(),
    externalCtaUrl: z.string().url('URL externa inválida').optional(),
    dynamicFormSchema: DynamicFormSchema.optional(),
    status: ProgramStatusSchema.optional().default('draft'),
  })
  .superRefine((input, ctx) => {
    validateExternalCtaCreate(input, ctx);
    validateRegistrationModeForCreate(input, ctx);
  });
export type CreateProgramInput = z.infer<typeof CreateProgramInputSchema>;

export const UpdateProgramInputSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    category: EventCategorySchema.optional(),
    description: z.string().min(10).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    totalSlots: z.number().int().positive().nullable().optional(),
    bannerUrl: UploadedImageUrlSchema.nullable().optional(),
    bannerAltText: z.string().nullable().optional(),
    registrationMode: RegistrationModeSchema.optional(),
    externalCtaLabel: z.string().min(2).max(120).nullable().optional(),
    externalCtaUrl: z.string().url('URL externa inválida').nullable().optional(),
    dynamicFormSchema: DynamicFormSchema.nullable().optional(),
    status: ProgramStatusSchema.optional(),
  })
  .superRefine((input, ctx) => {
    validateExternalCtaUpdate(input, ctx);
  });
export type UpdateProgramInput = z.infer<typeof UpdateProgramInputSchema>;

export const AdminProgramListRequestSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: ProgramStatusSchema.optional(),
  category: EventCategorySchema.optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['start_date_asc', 'start_date_desc', 'created_at_desc']).default('created_at_desc'),
});
export type AdminProgramListRequest = z.infer<typeof AdminProgramListRequestSchema>;

export const AdminProgramSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  category: EventCategorySchema,
  status: ProgramStatusSchema,
  startDate: z.string().datetime(),
  totalSlots: z.number().int().nullable(),
  registeredCount: z.number().int(),
  createdAt: z.string().datetime(),
  registrationMode: RegistrationModeSchema,
});
export type AdminProgramSummary = z.infer<typeof AdminProgramSummarySchema>;

export const AdminProgramListResponseSchema = z.object({
  data: z.array(AdminProgramSummarySchema),
  meta: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
});
export type AdminProgramListResponse = z.infer<typeof AdminProgramListResponseSchema>;

export const AdminProgramDetailResponseSchema = ProgramDetailSchema;
export type AdminProgramDetailResponse = z.infer<typeof AdminProgramDetailResponseSchema>;

export const PublicProgramsRequestSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: EventCategorySchema.optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['date_asc', 'date_desc']).default('date_asc'),
});
export type PublicProgramsRequest = z.infer<typeof PublicProgramsRequestSchema>;

export const PublicProgramsResponseSchema = z.object({
  data: z.array(ProgramSummarySchema),
  meta: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
});
export type PublicProgramsResponse = z.infer<typeof PublicProgramsResponseSchema>;

export const PublicProgramDetailResponseSchema = z.object({
  data: ProgramDetailSchema,
});
export type PublicProgramDetailResponse = z.infer<typeof PublicProgramDetailResponseSchema>;

// ─── Registrations ────────────────────────────────────────────────────────────

export const CreateRegistrationInputSchema = z.object({
  eventId: z.string().min(1),
  formData: z.record(z.string(), z.unknown()).optional(),
});
export type CreateRegistrationInput = z.infer<typeof CreateRegistrationInputSchema>;

export const RegistrationSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  protocolNumber: z.string(),
  status: RegistrationStatusSchema,
  formData: z.record(z.string(), z.unknown()).nullable(),
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

export const UserRegistrationDetailSchema = z.object({
  id: z.string(),
  protocolNumber: z.string(),
  status: RegistrationStatusSchema,
  formData: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string().datetime(),
  cancelledAt: z.string().datetime().nullable(),
  event: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    locationName: z.string(),
    locationAddress: z.string(),
    bannerUrl: z.string().nullable(),
    dynamicFormSchema: DynamicFormSchema.nullable(),
  }),
});
export type UserRegistrationDetail = z.infer<typeof UserRegistrationDetailSchema>;

export const UserRegistrationDetailResponseSchema = z.object({
  data: UserRegistrationDetailSchema,
});
export type UserRegistrationDetailResponse = z.infer<typeof UserRegistrationDetailResponseSchema>;

export const CreateRegistrationResponseSchema = z.object({
  registration: RegistrationSchema,
});
export type CreateRegistrationResponse = z.infer<typeof CreateRegistrationResponseSchema>;

// ─── Attendance intents ───────────────────────────────────────────────────────

export const AttendanceIntentStateSchema = z.object({
  eventId: z.string(),
  hasIntent: z.boolean(),
  attendeeCount: z.number().int().nonnegative(),
});
export type AttendanceIntentState = z.infer<typeof AttendanceIntentStateSchema>;

export const AttendanceIntentStateResponseSchema = z.object({
  data: AttendanceIntentStateSchema,
});
export type AttendanceIntentStateResponse = z.infer<typeof AttendanceIntentStateResponseSchema>;

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
