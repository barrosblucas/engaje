import {
  type AdminProgramListRequest,
  AdminProgramListRequestSchema,
  type CreateEventInput,
  CreateEventInputSchema,
  type CreateProgramInput,
  CreateProgramInputSchema,
  type CreateRegistrationInput,
  CreateRegistrationInputSchema,
  type DynamicForm,
  type DynamicFormField,
  DynamicFormSchema,
  type ProgramStatus,
  ProgramStatusSchema,
  type PublicProgramsRequest,
  PublicProgramsRequestSchema,
  type RegistrationMode,
  RegistrationModeSchema,
  type UpdateEventInput,
  UpdateEventInputSchema,
  type UpdateProgramInput,
  UpdateProgramInputSchema,
} from '@engaje/contracts';

export { DynamicFormSchema, ProgramStatusSchema, RegistrationModeSchema };

export type { DynamicForm, DynamicFormField, ProgramStatus, RegistrationMode };

// Backward-compatible aliases used by api services/controllers.
export const CreateEventWithModeInputSchema = CreateEventInputSchema;
export type CreateEventWithModeInput = CreateEventInput;

export const UpdateEventWithModeInputSchema = UpdateEventInputSchema;
export type UpdateEventWithModeInput = UpdateEventInput;

export const CreateRegistrationWithFormDataInputSchema = CreateRegistrationInputSchema;
export type CreateRegistrationWithFormDataInput = CreateRegistrationInput;

export const CreateProgramInputSchemaLocal = CreateProgramInputSchema;
export type CreateProgramInputLocal = CreateProgramInput;

export const UpdateProgramInputSchemaLocal = UpdateProgramInputSchema;
export type UpdateProgramInputLocal = UpdateProgramInput;

export const AdminProgramListRequestSchemaLocal = AdminProgramListRequestSchema;
export type AdminProgramListRequestLocal = AdminProgramListRequest;

export const PublicProgramsRequestSchemaLocal = PublicProgramsRequestSchema;
export type PublicProgramsRequestLocal = PublicProgramsRequest;
