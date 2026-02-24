import type { z } from 'zod';
export declare const UserRoleSchema: z.ZodEnum<['citizen', 'admin', 'super_admin']>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export declare const EventCategorySchema: z.ZodEnum<
  ['festa', 'esporte', 'civico', 'saude', 'cultura', 'educacao']
>;
export type EventCategory = z.infer<typeof EventCategorySchema>;
export declare const EventStatusSchema: z.ZodEnum<['draft', 'published', 'closed', 'cancelled']>;
export type EventStatus = z.infer<typeof EventStatusSchema>;
export declare const RegistrationStatusSchema: z.ZodEnum<['confirmed', 'cancelled']>;
export type RegistrationStatus = z.infer<typeof RegistrationStatusSchema>;
/** CPF deve conter exatamente 11 dígitos numéricos (sem formatação). */
export declare const CpfSchema: z.ZodString;
export declare const UserSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    cpf: z.ZodNullable<z.ZodString>;
    phone: z.ZodNullable<z.ZodString>;
    role: z.ZodEnum<['citizen', 'admin', 'super_admin']>;
    createdAt: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    name: string;
    email: string;
    cpf: string | null;
    phone: string | null;
    role: 'citizen' | 'admin' | 'super_admin';
    createdAt: string;
  },
  {
    id: string;
    name: string;
    email: string;
    cpf: string | null;
    phone: string | null;
    role: 'citizen' | 'admin' | 'super_admin';
    createdAt: string;
  }
>;
export type User = z.infer<typeof UserSchema>;
export declare const RegisterInputSchema: z.ZodObject<
  {
    name: z.ZodString;
    cpf: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    email: string;
    cpf: string;
    password: string;
    phone?: string | undefined;
  },
  {
    name: string;
    email: string;
    cpf: string;
    password: string;
    phone?: string | undefined;
  }
>;
export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export declare const RegisterResponseSchema: z.ZodObject<
  {
    user: z.ZodObject<
      {
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        cpf: z.ZodNullable<z.ZodString>;
        phone: z.ZodNullable<z.ZodString>;
        role: z.ZodEnum<['citizen', 'admin', 'super_admin']>;
        createdAt: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        id: string;
        name: string;
        email: string;
        cpf: string | null;
        phone: string | null;
        role: 'citizen' | 'admin' | 'super_admin';
        createdAt: string;
      },
      {
        id: string;
        name: string;
        email: string;
        cpf: string | null;
        phone: string | null;
        role: 'citizen' | 'admin' | 'super_admin';
        createdAt: string;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    user: {
      id: string;
      name: string;
      email: string;
      cpf: string | null;
      phone: string | null;
      role: 'citizen' | 'admin' | 'super_admin';
      createdAt: string;
    };
  },
  {
    user: {
      id: string;
      name: string;
      email: string;
      cpf: string | null;
      phone: string | null;
      role: 'citizen' | 'admin' | 'super_admin';
      createdAt: string;
    };
  }
>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export declare const LoginInputSchema: z.ZodObject<
  {
    /** Pode ser CPF (11 dígitos) ou e-mail. */
    identifier: z.ZodString;
    password: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    password: string;
    identifier: string;
  },
  {
    password: string;
    identifier: string;
  }
>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export declare const LoginResponseSchema: z.ZodObject<
  {
    user: z.ZodObject<
      {
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        cpf: z.ZodNullable<z.ZodString>;
        phone: z.ZodNullable<z.ZodString>;
        role: z.ZodEnum<['citizen', 'admin', 'super_admin']>;
        createdAt: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        id: string;
        name: string;
        email: string;
        cpf: string | null;
        phone: string | null;
        role: 'citizen' | 'admin' | 'super_admin';
        createdAt: string;
      },
      {
        id: string;
        name: string;
        email: string;
        cpf: string | null;
        phone: string | null;
        role: 'citizen' | 'admin' | 'super_admin';
        createdAt: string;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    user: {
      id: string;
      name: string;
      email: string;
      cpf: string | null;
      phone: string | null;
      role: 'citizen' | 'admin' | 'super_admin';
      createdAt: string;
    };
  },
  {
    user: {
      id: string;
      name: string;
      email: string;
      cpf: string | null;
      phone: string | null;
      role: 'citizen' | 'admin' | 'super_admin';
      createdAt: string;
    };
  }
>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export declare const MeResponseSchema: z.ZodObject<
  {
    user: z.ZodObject<
      {
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        cpf: z.ZodNullable<z.ZodString>;
        phone: z.ZodNullable<z.ZodString>;
        role: z.ZodEnum<['citizen', 'admin', 'super_admin']>;
        createdAt: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        id: string;
        name: string;
        email: string;
        cpf: string | null;
        phone: string | null;
        role: 'citizen' | 'admin' | 'super_admin';
        createdAt: string;
      },
      {
        id: string;
        name: string;
        email: string;
        cpf: string | null;
        phone: string | null;
        role: 'citizen' | 'admin' | 'super_admin';
        createdAt: string;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    user: {
      id: string;
      name: string;
      email: string;
      cpf: string | null;
      phone: string | null;
      role: 'citizen' | 'admin' | 'super_admin';
      createdAt: string;
    };
  },
  {
    user: {
      id: string;
      name: string;
      email: string;
      cpf: string | null;
      phone: string | null;
      role: 'citizen' | 'admin' | 'super_admin';
      createdAt: string;
    };
  }
>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
export declare const CreateAdminUserInputSchema: z.ZodObject<
  {
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<['admin', 'super_admin']>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    email: string;
    role: 'admin' | 'super_admin';
    password: string;
  },
  {
    name: string;
    email: string;
    role: 'admin' | 'super_admin';
    password: string;
  }
>;
export type CreateAdminUserInput = z.infer<typeof CreateAdminUserInputSchema>;
export declare const EventSummarySchema: z.ZodObject<
  {
    id: z.ZodString;
    title: z.ZodString;
    slug: z.ZodString;
    category: z.ZodEnum<['festa', 'esporte', 'civico', 'saude', 'cultura', 'educacao']>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    locationName: z.ZodString;
    bannerUrl: z.ZodNullable<z.ZodString>;
    bannerAltText: z.ZodNullable<z.ZodString>;
    /** null = vagas ilimitadas */
    availableSlots: z.ZodNullable<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    title: string;
    slug: string;
    category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
    startDate: string;
    locationName: string;
    bannerUrl: string | null;
    bannerAltText: string | null;
    availableSlots: number | null;
    endDate?: string | undefined;
  },
  {
    id: string;
    title: string;
    slug: string;
    category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
    startDate: string;
    locationName: string;
    bannerUrl: string | null;
    bannerAltText: string | null;
    availableSlots: number | null;
    endDate?: string | undefined;
  }
>;
export type EventSummary = z.infer<typeof EventSummarySchema>;
export declare const EventImageSchema: z.ZodObject<
  {
    id: z.ZodString;
    imageUrl: z.ZodString;
    altText: z.ZodString;
    displayOrder: z.ZodNumber;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    imageUrl: string;
    altText: string;
    displayOrder: number;
  },
  {
    id: string;
    imageUrl: string;
    altText: string;
    displayOrder: number;
  }
>;
export type EventImage = z.infer<typeof EventImageSchema>;
export declare const EventDetailSchema: z.ZodObject<
  {
    id: z.ZodString;
    title: z.ZodString;
    slug: z.ZodString;
    category: z.ZodEnum<['festa', 'esporte', 'civico', 'saude', 'cultura', 'educacao']>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    locationName: z.ZodString;
    bannerUrl: z.ZodNullable<z.ZodString>;
    bannerAltText: z.ZodNullable<z.ZodString>;
    /** null = vagas ilimitadas */
    availableSlots: z.ZodNullable<z.ZodNumber>;
  } & {
    description: z.ZodString;
    locationAddress: z.ZodString;
    locationLat: z.ZodNullable<z.ZodNumber>;
    locationLng: z.ZodNullable<z.ZodNumber>;
    totalSlots: z.ZodNullable<z.ZodNumber>;
    status: z.ZodEnum<['draft', 'published', 'closed', 'cancelled']>;
    images: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          imageUrl: z.ZodString;
          altText: z.ZodString;
          displayOrder: z.ZodNumber;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          imageUrl: string;
          altText: string;
          displayOrder: number;
        },
        {
          id: string;
          imageUrl: string;
          altText: string;
          displayOrder: number;
        }
      >,
      'many'
    >;
    createdAt: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'draft' | 'published' | 'closed' | 'cancelled';
    id: string;
    createdAt: string;
    title: string;
    slug: string;
    category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
    startDate: string;
    locationName: string;
    bannerUrl: string | null;
    bannerAltText: string | null;
    availableSlots: number | null;
    description: string;
    locationAddress: string;
    locationLat: number | null;
    locationLng: number | null;
    totalSlots: number | null;
    images: {
      id: string;
      imageUrl: string;
      altText: string;
      displayOrder: number;
    }[];
    endDate?: string | undefined;
  },
  {
    status: 'draft' | 'published' | 'closed' | 'cancelled';
    id: string;
    createdAt: string;
    title: string;
    slug: string;
    category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
    startDate: string;
    locationName: string;
    bannerUrl: string | null;
    bannerAltText: string | null;
    availableSlots: number | null;
    description: string;
    locationAddress: string;
    locationLat: number | null;
    locationLng: number | null;
    totalSlots: number | null;
    images: {
      id: string;
      imageUrl: string;
      altText: string;
      displayOrder: number;
    }[];
    endDate?: string | undefined;
  }
>;
export type EventDetail = z.infer<typeof EventDetailSchema>;
export declare const PublicEventsRequestSchema: z.ZodObject<
  {
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    category: z.ZodOptional<
      z.ZodEnum<['festa', 'esporte', 'civico', 'saude', 'cultura', 'educacao']>
    >;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodDefault<z.ZodEnum<['date_asc', 'date_desc']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    sort: 'date_asc' | 'date_desc';
    page: number;
    limit: number;
    category?: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao' | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    search?: string | undefined;
  },
  {
    sort?: 'date_asc' | 'date_desc' | undefined;
    category?: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao' | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
  }
>;
export type PublicEventsRequest = z.infer<typeof PublicEventsRequestSchema>;
export declare const PublicEventsResponseSchema: z.ZodObject<
  {
    data: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          title: z.ZodString;
          slug: z.ZodString;
          category: z.ZodEnum<['festa', 'esporte', 'civico', 'saude', 'cultura', 'educacao']>;
          startDate: z.ZodString;
          endDate: z.ZodOptional<z.ZodString>;
          locationName: z.ZodString;
          bannerUrl: z.ZodNullable<z.ZodString>;
          bannerAltText: z.ZodNullable<z.ZodString>;
          /** null = vagas ilimitadas */
          availableSlots: z.ZodNullable<z.ZodNumber>;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          title: string;
          slug: string;
          category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
          startDate: string;
          locationName: string;
          bannerUrl: string | null;
          bannerAltText: string | null;
          availableSlots: number | null;
          endDate?: string | undefined;
        },
        {
          id: string;
          title: string;
          slug: string;
          category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
          startDate: string;
          locationName: string;
          bannerUrl: string | null;
          bannerAltText: string | null;
          availableSlots: number | null;
          endDate?: string | undefined;
        }
      >,
      'many'
    >;
    meta: z.ZodObject<
      {
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      },
      {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    data: {
      id: string;
      title: string;
      slug: string;
      category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
      startDate: string;
      locationName: string;
      bannerUrl: string | null;
      bannerAltText: string | null;
      availableSlots: number | null;
      endDate?: string | undefined;
    }[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  },
  {
    data: {
      id: string;
      title: string;
      slug: string;
      category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
      startDate: string;
      locationName: string;
      bannerUrl: string | null;
      bannerAltText: string | null;
      availableSlots: number | null;
      endDate?: string | undefined;
    }[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
>;
export type PublicEventsResponse = z.infer<typeof PublicEventsResponseSchema>;
export declare const PublicEventDetailResponseSchema: z.ZodObject<
  {
    data: z.ZodObject<
      {
        id: z.ZodString;
        title: z.ZodString;
        slug: z.ZodString;
        category: z.ZodEnum<['festa', 'esporte', 'civico', 'saude', 'cultura', 'educacao']>;
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodString>;
        locationName: z.ZodString;
        bannerUrl: z.ZodNullable<z.ZodString>;
        bannerAltText: z.ZodNullable<z.ZodString>;
        /** null = vagas ilimitadas */
        availableSlots: z.ZodNullable<z.ZodNumber>;
      } & {
        description: z.ZodString;
        locationAddress: z.ZodString;
        locationLat: z.ZodNullable<z.ZodNumber>;
        locationLng: z.ZodNullable<z.ZodNumber>;
        totalSlots: z.ZodNullable<z.ZodNumber>;
        status: z.ZodEnum<['draft', 'published', 'closed', 'cancelled']>;
        images: z.ZodArray<
          z.ZodObject<
            {
              id: z.ZodString;
              imageUrl: z.ZodString;
              altText: z.ZodString;
              displayOrder: z.ZodNumber;
            },
            'strip',
            z.ZodTypeAny,
            {
              id: string;
              imageUrl: string;
              altText: string;
              displayOrder: number;
            },
            {
              id: string;
              imageUrl: string;
              altText: string;
              displayOrder: number;
            }
          >,
          'many'
        >;
        createdAt: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        status: 'draft' | 'published' | 'closed' | 'cancelled';
        id: string;
        createdAt: string;
        title: string;
        slug: string;
        category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
        startDate: string;
        locationName: string;
        bannerUrl: string | null;
        bannerAltText: string | null;
        availableSlots: number | null;
        description: string;
        locationAddress: string;
        locationLat: number | null;
        locationLng: number | null;
        totalSlots: number | null;
        images: {
          id: string;
          imageUrl: string;
          altText: string;
          displayOrder: number;
        }[];
        endDate?: string | undefined;
      },
      {
        status: 'draft' | 'published' | 'closed' | 'cancelled';
        id: string;
        createdAt: string;
        title: string;
        slug: string;
        category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
        startDate: string;
        locationName: string;
        bannerUrl: string | null;
        bannerAltText: string | null;
        availableSlots: number | null;
        description: string;
        locationAddress: string;
        locationLat: number | null;
        locationLng: number | null;
        totalSlots: number | null;
        images: {
          id: string;
          imageUrl: string;
          altText: string;
          displayOrder: number;
        }[];
        endDate?: string | undefined;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    data: {
      status: 'draft' | 'published' | 'closed' | 'cancelled';
      id: string;
      createdAt: string;
      title: string;
      slug: string;
      category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
      startDate: string;
      locationName: string;
      bannerUrl: string | null;
      bannerAltText: string | null;
      availableSlots: number | null;
      description: string;
      locationAddress: string;
      locationLat: number | null;
      locationLng: number | null;
      totalSlots: number | null;
      images: {
        id: string;
        imageUrl: string;
        altText: string;
        displayOrder: number;
      }[];
      endDate?: string | undefined;
    };
  },
  {
    data: {
      status: 'draft' | 'published' | 'closed' | 'cancelled';
      id: string;
      createdAt: string;
      title: string;
      slug: string;
      category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
      startDate: string;
      locationName: string;
      bannerUrl: string | null;
      bannerAltText: string | null;
      availableSlots: number | null;
      description: string;
      locationAddress: string;
      locationLat: number | null;
      locationLng: number | null;
      totalSlots: number | null;
      images: {
        id: string;
        imageUrl: string;
        altText: string;
        displayOrder: number;
      }[];
      endDate?: string | undefined;
    };
  }
>;
export type PublicEventDetailResponse = z.infer<typeof PublicEventDetailResponseSchema>;
export declare const CreateEventInputSchema: z.ZodObject<
  {
    title: z.ZodString;
    category: z.ZodEnum<['festa', 'esporte', 'civico', 'saude', 'cultura', 'educacao']>;
    description: z.ZodString;
    startDate: z.ZodString;
    endDate: z.ZodString;
    locationName: z.ZodString;
    locationAddress: z.ZodString;
    locationLat: z.ZodOptional<z.ZodNumber>;
    locationLng: z.ZodOptional<z.ZodNumber>;
    totalSlots: z.ZodOptional<z.ZodNumber>;
    bannerAltText: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<['draft', 'published', 'closed', 'cancelled']>>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'draft' | 'published' | 'closed' | 'cancelled';
    title: string;
    category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
    startDate: string;
    endDate: string;
    locationName: string;
    description: string;
    locationAddress: string;
    bannerAltText?: string | undefined;
    locationLat?: number | undefined;
    locationLng?: number | undefined;
    totalSlots?: number | undefined;
  },
  {
    title: string;
    category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
    startDate: string;
    endDate: string;
    locationName: string;
    description: string;
    locationAddress: string;
    status?: 'draft' | 'published' | 'closed' | 'cancelled' | undefined;
    bannerAltText?: string | undefined;
    locationLat?: number | undefined;
    locationLng?: number | undefined;
    totalSlots?: number | undefined;
  }
>;
export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;
export declare const UpdateEventInputSchema: z.ZodObject<
  {
    title: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<
      z.ZodEnum<['festa', 'esporte', 'civico', 'saude', 'cultura', 'educacao']>
    >;
    description: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    locationName: z.ZodOptional<z.ZodString>;
    locationAddress: z.ZodOptional<z.ZodString>;
    locationLat: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    locationLng: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    totalSlots: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    bannerAltText: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<
      z.ZodDefault<z.ZodOptional<z.ZodEnum<['draft', 'published', 'closed', 'cancelled']>>>
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    status?: 'draft' | 'published' | 'closed' | 'cancelled' | undefined;
    title?: string | undefined;
    category?: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao' | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    locationName?: string | undefined;
    bannerAltText?: string | undefined;
    description?: string | undefined;
    locationAddress?: string | undefined;
    locationLat?: number | undefined;
    locationLng?: number | undefined;
    totalSlots?: number | undefined;
  },
  {
    status?: 'draft' | 'published' | 'closed' | 'cancelled' | undefined;
    title?: string | undefined;
    category?: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao' | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    locationName?: string | undefined;
    bannerAltText?: string | undefined;
    description?: string | undefined;
    locationAddress?: string | undefined;
    locationLat?: number | undefined;
    locationLng?: number | undefined;
    totalSlots?: number | undefined;
  }
>;
export type UpdateEventInput = z.infer<typeof UpdateEventInputSchema>;
export declare const UpdateEventStatusInputSchema: z.ZodObject<
  {
    status: z.ZodEnum<['published', 'closed', 'cancelled']>;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'published' | 'closed' | 'cancelled';
  },
  {
    status: 'published' | 'closed' | 'cancelled';
  }
>;
export type UpdateEventStatusInput = z.infer<typeof UpdateEventStatusInputSchema>;
export declare const AdminEventListRequestSchema: z.ZodObject<
  {
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<['draft', 'published', 'closed', 'cancelled']>>;
    category: z.ZodOptional<
      z.ZodEnum<['festa', 'esporte', 'civico', 'saude', 'cultura', 'educacao']>
    >;
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodDefault<z.ZodEnum<['start_date_asc', 'start_date_desc', 'created_at_desc']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    sort: 'start_date_asc' | 'start_date_desc' | 'created_at_desc';
    page: number;
    limit: number;
    status?: 'draft' | 'published' | 'closed' | 'cancelled' | undefined;
    category?: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao' | undefined;
    search?: string | undefined;
  },
  {
    sort?: 'start_date_asc' | 'start_date_desc' | 'created_at_desc' | undefined;
    status?: 'draft' | 'published' | 'closed' | 'cancelled' | undefined;
    category?: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao' | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
  }
>;
export type AdminEventListRequest = z.infer<typeof AdminEventListRequestSchema>;
export declare const AdminEventSummarySchema: z.ZodObject<
  {
    id: z.ZodString;
    title: z.ZodString;
    slug: z.ZodString;
    category: z.ZodEnum<['festa', 'esporte', 'civico', 'saude', 'cultura', 'educacao']>;
    status: z.ZodEnum<['draft', 'published', 'closed', 'cancelled']>;
    startDate: z.ZodString;
    totalSlots: z.ZodNullable<z.ZodNumber>;
    registeredCount: z.ZodNumber;
    createdAt: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'draft' | 'published' | 'closed' | 'cancelled';
    id: string;
    createdAt: string;
    title: string;
    slug: string;
    category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
    startDate: string;
    totalSlots: number | null;
    registeredCount: number;
  },
  {
    status: 'draft' | 'published' | 'closed' | 'cancelled';
    id: string;
    createdAt: string;
    title: string;
    slug: string;
    category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
    startDate: string;
    totalSlots: number | null;
    registeredCount: number;
  }
>;
export type AdminEventSummary = z.infer<typeof AdminEventSummarySchema>;
export declare const AdminEventListResponseSchema: z.ZodObject<
  {
    data: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          title: z.ZodString;
          slug: z.ZodString;
          category: z.ZodEnum<['festa', 'esporte', 'civico', 'saude', 'cultura', 'educacao']>;
          status: z.ZodEnum<['draft', 'published', 'closed', 'cancelled']>;
          startDate: z.ZodString;
          totalSlots: z.ZodNullable<z.ZodNumber>;
          registeredCount: z.ZodNumber;
          createdAt: z.ZodString;
        },
        'strip',
        z.ZodTypeAny,
        {
          status: 'draft' | 'published' | 'closed' | 'cancelled';
          id: string;
          createdAt: string;
          title: string;
          slug: string;
          category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
          startDate: string;
          totalSlots: number | null;
          registeredCount: number;
        },
        {
          status: 'draft' | 'published' | 'closed' | 'cancelled';
          id: string;
          createdAt: string;
          title: string;
          slug: string;
          category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
          startDate: string;
          totalSlots: number | null;
          registeredCount: number;
        }
      >,
      'many'
    >;
    meta: z.ZodObject<
      {
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      },
      {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    data: {
      status: 'draft' | 'published' | 'closed' | 'cancelled';
      id: string;
      createdAt: string;
      title: string;
      slug: string;
      category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
      startDate: string;
      totalSlots: number | null;
      registeredCount: number;
    }[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  },
  {
    data: {
      status: 'draft' | 'published' | 'closed' | 'cancelled';
      id: string;
      createdAt: string;
      title: string;
      slug: string;
      category: 'festa' | 'esporte' | 'civico' | 'saude' | 'cultura' | 'educacao';
      startDate: string;
      totalSlots: number | null;
      registeredCount: number;
    }[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
>;
export type AdminEventListResponse = z.infer<typeof AdminEventListResponseSchema>;
export declare const CreateRegistrationInputSchema: z.ZodObject<
  {
    eventId: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    eventId: string;
  },
  {
    eventId: string;
  }
>;
export type CreateRegistrationInput = z.infer<typeof CreateRegistrationInputSchema>;
export declare const RegistrationSchema: z.ZodObject<
  {
    id: z.ZodString;
    eventId: z.ZodString;
    userId: z.ZodString;
    protocolNumber: z.ZodString;
    status: z.ZodEnum<['confirmed', 'cancelled']>;
    createdAt: z.ZodString;
    cancelledAt: z.ZodNullable<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'cancelled' | 'confirmed';
    id: string;
    createdAt: string;
    eventId: string;
    userId: string;
    protocolNumber: string;
    cancelledAt: string | null;
  },
  {
    status: 'cancelled' | 'confirmed';
    id: string;
    createdAt: string;
    eventId: string;
    userId: string;
    protocolNumber: string;
    cancelledAt: string | null;
  }
>;
export type Registration = z.infer<typeof RegistrationSchema>;
export declare const UserRegistrationSchema: z.ZodObject<
  {
    id: z.ZodString;
    protocolNumber: z.ZodString;
    status: z.ZodEnum<['confirmed', 'cancelled']>;
    createdAt: z.ZodString;
    cancelledAt: z.ZodNullable<z.ZodString>;
    event: z.ZodObject<
      {
        id: z.ZodString;
        title: z.ZodString;
        slug: z.ZodString;
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodString>;
        locationName: z.ZodString;
        bannerUrl: z.ZodNullable<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        id: string;
        title: string;
        slug: string;
        startDate: string;
        locationName: string;
        bannerUrl: string | null;
        endDate?: string | undefined;
      },
      {
        id: string;
        title: string;
        slug: string;
        startDate: string;
        locationName: string;
        bannerUrl: string | null;
        endDate?: string | undefined;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    event: {
      id: string;
      title: string;
      slug: string;
      startDate: string;
      locationName: string;
      bannerUrl: string | null;
      endDate?: string | undefined;
    };
    status: 'cancelled' | 'confirmed';
    id: string;
    createdAt: string;
    protocolNumber: string;
    cancelledAt: string | null;
  },
  {
    event: {
      id: string;
      title: string;
      slug: string;
      startDate: string;
      locationName: string;
      bannerUrl: string | null;
      endDate?: string | undefined;
    };
    status: 'cancelled' | 'confirmed';
    id: string;
    createdAt: string;
    protocolNumber: string;
    cancelledAt: string | null;
  }
>;
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export declare const UserRegistrationsResponseSchema: z.ZodObject<
  {
    data: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          protocolNumber: z.ZodString;
          status: z.ZodEnum<['confirmed', 'cancelled']>;
          createdAt: z.ZodString;
          cancelledAt: z.ZodNullable<z.ZodString>;
          event: z.ZodObject<
            {
              id: z.ZodString;
              title: z.ZodString;
              slug: z.ZodString;
              startDate: z.ZodString;
              endDate: z.ZodOptional<z.ZodString>;
              locationName: z.ZodString;
              bannerUrl: z.ZodNullable<z.ZodString>;
            },
            'strip',
            z.ZodTypeAny,
            {
              id: string;
              title: string;
              slug: string;
              startDate: string;
              locationName: string;
              bannerUrl: string | null;
              endDate?: string | undefined;
            },
            {
              id: string;
              title: string;
              slug: string;
              startDate: string;
              locationName: string;
              bannerUrl: string | null;
              endDate?: string | undefined;
            }
          >;
        },
        'strip',
        z.ZodTypeAny,
        {
          event: {
            id: string;
            title: string;
            slug: string;
            startDate: string;
            locationName: string;
            bannerUrl: string | null;
            endDate?: string | undefined;
          };
          status: 'cancelled' | 'confirmed';
          id: string;
          createdAt: string;
          protocolNumber: string;
          cancelledAt: string | null;
        },
        {
          event: {
            id: string;
            title: string;
            slug: string;
            startDate: string;
            locationName: string;
            bannerUrl: string | null;
            endDate?: string | undefined;
          };
          status: 'cancelled' | 'confirmed';
          id: string;
          createdAt: string;
          protocolNumber: string;
          cancelledAt: string | null;
        }
      >,
      'many'
    >;
    meta: z.ZodObject<
      {
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      },
      {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    data: {
      event: {
        id: string;
        title: string;
        slug: string;
        startDate: string;
        locationName: string;
        bannerUrl: string | null;
        endDate?: string | undefined;
      };
      status: 'cancelled' | 'confirmed';
      id: string;
      createdAt: string;
      protocolNumber: string;
      cancelledAt: string | null;
    }[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  },
  {
    data: {
      event: {
        id: string;
        title: string;
        slug: string;
        startDate: string;
        locationName: string;
        bannerUrl: string | null;
        endDate?: string | undefined;
      };
      status: 'cancelled' | 'confirmed';
      id: string;
      createdAt: string;
      protocolNumber: string;
      cancelledAt: string | null;
    }[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
>;
export type UserRegistrationsResponse = z.infer<typeof UserRegistrationsResponseSchema>;
export declare const CreateRegistrationResponseSchema: z.ZodObject<
  {
    registration: z.ZodObject<
      {
        id: z.ZodString;
        eventId: z.ZodString;
        userId: z.ZodString;
        protocolNumber: z.ZodString;
        status: z.ZodEnum<['confirmed', 'cancelled']>;
        createdAt: z.ZodString;
        cancelledAt: z.ZodNullable<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        status: 'cancelled' | 'confirmed';
        id: string;
        createdAt: string;
        eventId: string;
        userId: string;
        protocolNumber: string;
        cancelledAt: string | null;
      },
      {
        status: 'cancelled' | 'confirmed';
        id: string;
        createdAt: string;
        eventId: string;
        userId: string;
        protocolNumber: string;
        cancelledAt: string | null;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    registration: {
      status: 'cancelled' | 'confirmed';
      id: string;
      createdAt: string;
      eventId: string;
      userId: string;
      protocolNumber: string;
      cancelledAt: string | null;
    };
  },
  {
    registration: {
      status: 'cancelled' | 'confirmed';
      id: string;
      createdAt: string;
      eventId: string;
      userId: string;
      protocolNumber: string;
      cancelledAt: string | null;
    };
  }
>;
export type CreateRegistrationResponse = z.infer<typeof CreateRegistrationResponseSchema>;
export declare const AdminRegistrationSchema: z.ZodObject<
  {
    id: z.ZodString;
    protocolNumber: z.ZodString;
    status: z.ZodEnum<['confirmed', 'cancelled']>;
    createdAt: z.ZodString;
    cancelledAt: z.ZodNullable<z.ZodString>;
    user: z.ZodObject<
      {
        id: z.ZodString;
        name: z.ZodString;
        cpf: z.ZodNullable<z.ZodString>;
        email: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        id: string;
        name: string;
        email: string;
        cpf: string | null;
        phone: string | null;
      },
      {
        id: string;
        name: string;
        email: string;
        cpf: string | null;
        phone: string | null;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    user: {
      id: string;
      name: string;
      email: string;
      cpf: string | null;
      phone: string | null;
    };
    status: 'cancelled' | 'confirmed';
    id: string;
    createdAt: string;
    protocolNumber: string;
    cancelledAt: string | null;
  },
  {
    user: {
      id: string;
      name: string;
      email: string;
      cpf: string | null;
      phone: string | null;
    };
    status: 'cancelled' | 'confirmed';
    id: string;
    createdAt: string;
    protocolNumber: string;
    cancelledAt: string | null;
  }
>;
export type AdminRegistration = z.infer<typeof AdminRegistrationSchema>;
export declare const AdminRegistrationsRequestSchema: z.ZodObject<
  {
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<['confirmed', 'cancelled']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    page: number;
    limit: number;
    status?: 'cancelled' | 'confirmed' | undefined;
  },
  {
    status?: 'cancelled' | 'confirmed' | undefined;
    page?: number | undefined;
    limit?: number | undefined;
  }
>;
export type AdminRegistrationsRequest = z.infer<typeof AdminRegistrationsRequestSchema>;
export declare const AdminRegistrationsResponseSchema: z.ZodObject<
  {
    data: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          protocolNumber: z.ZodString;
          status: z.ZodEnum<['confirmed', 'cancelled']>;
          createdAt: z.ZodString;
          cancelledAt: z.ZodNullable<z.ZodString>;
          user: z.ZodObject<
            {
              id: z.ZodString;
              name: z.ZodString;
              cpf: z.ZodNullable<z.ZodString>;
              email: z.ZodString;
              phone: z.ZodNullable<z.ZodString>;
            },
            'strip',
            z.ZodTypeAny,
            {
              id: string;
              name: string;
              email: string;
              cpf: string | null;
              phone: string | null;
            },
            {
              id: string;
              name: string;
              email: string;
              cpf: string | null;
              phone: string | null;
            }
          >;
        },
        'strip',
        z.ZodTypeAny,
        {
          user: {
            id: string;
            name: string;
            email: string;
            cpf: string | null;
            phone: string | null;
          };
          status: 'cancelled' | 'confirmed';
          id: string;
          createdAt: string;
          protocolNumber: string;
          cancelledAt: string | null;
        },
        {
          user: {
            id: string;
            name: string;
            email: string;
            cpf: string | null;
            phone: string | null;
          };
          status: 'cancelled' | 'confirmed';
          id: string;
          createdAt: string;
          protocolNumber: string;
          cancelledAt: string | null;
        }
      >,
      'many'
    >;
    meta: z.ZodObject<
      {
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      },
      {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    data: {
      user: {
        id: string;
        name: string;
        email: string;
        cpf: string | null;
        phone: string | null;
      };
      status: 'cancelled' | 'confirmed';
      id: string;
      createdAt: string;
      protocolNumber: string;
      cancelledAt: string | null;
    }[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  },
  {
    data: {
      user: {
        id: string;
        name: string;
        email: string;
        cpf: string | null;
        phone: string | null;
      };
      status: 'cancelled' | 'confirmed';
      id: string;
      createdAt: string;
      protocolNumber: string;
      cancelledAt: string | null;
    }[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
>;
export type AdminRegistrationsResponse = z.infer<typeof AdminRegistrationsResponseSchema>;
export declare const ApiErrorSchema: z.ZodObject<
  {
    statusCode: z.ZodNumber;
    error: z.ZodString;
    message: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    error: string;
    message: string;
    statusCode: number;
  },
  {
    error: string;
    message: string;
    statusCode: number;
  }
>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
//# sourceMappingURL=index.d.ts.map
