import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import type { ObligationStatus, ObligationType } from '@repo/types';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const ObligationTypeSchema = z
  .enum([
    'annual_report',
    'franchise_tax',
    'boi_report',
    'registered_agent_renewal',
  ] satisfies [ObligationType, ...ObligationType[]])
  .openapi('ObligationType', {
    description: 'Kind of compliance obligation being tracked.',
    example: 'annual_report',
  });

export const ObligationStatusSchema = z
  .enum([
    'pending',
    'in_progress',
    'submitted',
    'done',
  ] satisfies [ObligationStatus, ...ObligationStatus[]])
  .openapi('ObligationStatus', {
    description: 'Current lifecycle status of the obligation.',
    example: 'pending',
  });

const ObligationObjectSchema = z.object({
  id: z.uuid().openapi({
    description: 'Stable obligation identifier.',
    example: '8a3a4e8f-9a84-42dd-8c1f-e6b6edc7d04b',
  }),
  type: ObligationTypeSchema,
  title: z.string().min(1).openapi({
    example: 'File annual report',
  }),
  description: z.string().min(1).openapi({
    example: 'Submit the annual report before the state deadline.',
  }),
  status: ObligationStatusSchema,
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).openapi({
    description: 'Due date in YYYY-MM-DD format.',
    example: '2026-08-15',
    format: 'date',
  }),
  owner: z.string().min(1).openapi({
    description: 'Responsible person or team.',
    example: 'Legal Ops',
  }),
  requiresDocument: z.boolean().openapi({
    description: 'Whether submission requires an attached document.',
    example: true,
  }),
  companyTaxId: z.string().min(4).openapi({
    description: 'Sensitive tax identifier. Store full value; mask in reads.',
    example: '12-3456789',
  }),
});

export const ObligationSchema = ObligationObjectSchema.openapi('Obligation', {
  description: 'Compliance obligation API contract.',
});

export const CreateObligationSchema = ObligationSchema.omit({ id: true }).openapi(
  'CreateObligationRequest',
  {
    description: 'Request body for creating a compliance obligation.',
  },
);

export const ObligationIdParamsSchema = z
  .object({
    id: z.uuid(),
  })
  .openapi('ObligationIdParams');

export const UpdateObligationStatusSchema = z
  .object({
    status: ObligationStatusSchema,
  })
  .openapi('UpdateObligationStatusRequest', {
    description: 'Request body for changing an obligation status.',
  });

export type ObligationModel = z.infer<typeof ObligationSchema>;
export type CreateObligationModel = z.infer<typeof CreateObligationSchema>;
export type UpdateObligationStatusModel = z.infer<
  typeof UpdateObligationStatusSchema
>;
