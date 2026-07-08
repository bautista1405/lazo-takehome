import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import type {
  BlockedObligationTransition,
  ObligationStatus,
  ObligationStatusChange,
  ObligationType,
} from '@repo/types';
import { z } from 'zod';

extendZodWithOpenApi(z);

const obligationTypes = [
  'annual_report',
  'franchise_tax',
  'boi_report',
  'registered_agent_renewal',
] as const satisfies readonly [ObligationType, ...ObligationType[]];

const obligationStatuses = [
  'pending',
  'in_progress',
  'submitted',
  'done',
] as const satisfies readonly [ObligationStatus, ...ObligationStatus[]];

export const ObligationTypeSchema = z
  .enum(obligationTypes)
  .openapi('ObligationType', {
    description: 'Kind of compliance obligation being tracked.',
    example: 'annual_report',
  });

export const ObligationStatusSchema = z
  .enum(obligationStatuses)
  .openapi('ObligationStatus', {
    description: 'Current lifecycle status of the obligation.',
    example: 'pending',
  });

const ObligationObjectSchema = z.object({
  id: z.uuid().openapi({
    description: 'Stable obligation identifier.',
    example: '8a3a4e8f-9a84-42dd-8c1f-e6b6edc7d04b',
  }),
  version: z.number().int().positive().openapi({
    description:
      'Optimistic concurrency version. Send this back as expectedVersion when mutating.',
    example: 1,
  }),
  type: ObligationTypeSchema,
  title: z.string().min(1).openapi({
    example: 'File annual report',
  }),
  description: z.string().min(1).openapi({
    example: 'Submit the annual report before the state deadline.',
  }),
  status: ObligationStatusSchema,
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .openapi({
      description: 'Due date in YYYY-MM-DD format.',
      example: '2026-08-15',
      format: 'date',
    }),
  owner: z.string().min(1).openapi({
    description: 'Responsible person or team.',
    example: 'Legal Ops',
  }),
  requiresDocument: z.boolean().openapi({
    description:
      'Whether this obligation is expected to have supporting evidence.',
    example: true,
  }),
  documentUrl: z.url().nullable().optional().openapi({
    description:
      'URL for the supporting document. Required before submitting when requiresDocument is true.',
    example: 'https://example.com/documents/annual-report.pdf',
  }),
  companyTaxId: z.string().min(4).openapi({
    description: 'Sensitive tax identifier. Store full value; mask in reads.',
    example: '12-3456789',
  }),
});

export const ObligationSchema = ObligationObjectSchema;

export const CreateObligationSchema = ObligationSchema.omit({
  id: true,
  status: true,
  version: true,
}).openapi('CreateObligationRequest', {
  description:
    'Request body for creating a compliance obligation. New obligations start as pending.',
});

const ExpectedVersionSchema = z.number().int().positive().openapi({
  description:
    'Version observed by the client. The write fails with 409 when it is stale.',
  example: 1,
});

const UpdateObligationFieldsSchema = CreateObligationSchema.partial();

export const UpdateObligationSchema = UpdateObligationFieldsSchema.extend({
  expectedVersion: ExpectedVersionSchema,
})
  .strict()
  .refine(
    (body) => Object.keys(body).some((key) => key !== 'expectedVersion'),
    {
      message: 'Provide at least one obligation field to update.',
    },
  )
  .openapi('UpdateObligationRequest', {
    description:
      'Request body for editing obligation details. Status changes must use the status endpoint.',
  });

export const ObligationStatusChangeSchema = z
  .object({
    id: z.uuid().openapi({
      description: 'Stable audit entry identifier.',
      example: '5a8fc174-f691-4b14-a71a-71f24c14a0cb',
    }),
    obligationId: z.uuid().openapi({
      description: 'Obligation whose status changed.',
      example: '8a3a4e8f-9a84-42dd-8c1f-e6b6edc7d04b',
    }),
    fromStatus: ObligationStatusSchema,
    toStatus: ObligationStatusSchema,
    changedAt: z.iso.datetime().openapi({
      description: 'Timestamp when the status change was persisted.',
      example: '2026-07-08T15:30:00.000Z',
    }),
  } satisfies Record<keyof ObligationStatusChange, z.ZodType>)
  .openapi('ObligationStatusChange', {
    description: 'Audit entry for a persisted obligation status transition.',
  });

export const BlockedObligationTransitionSchema = z
  .object({
    status: ObligationStatusSchema,
    reason: z.literal('document_required').openapi({
      description: 'Machine-readable reason why the transition is blocked.',
      example: 'document_required',
    }),
  } satisfies Record<keyof BlockedObligationTransition, z.ZodType>)
  .openapi('BlockedObligationTransition', {
    description:
      'Backend-owned transition that is visible but currently blocked.',
  });

export const ObligationResponseSchema = ObligationSchema.omit({
  companyTaxId: true,
})
  .extend({
    maskedCompanyTaxId: z.string().openapi({
      description:
        'Masked tax identifier. The backend never returns the full value in read responses.',
      example: '**-***6789',
    }),
    overdue: z.boolean().openapi({
      description: 'Whether the obligation is past due and not done.',
      example: false,
    }),
    allowedTransitions: z.array(ObligationStatusSchema).openapi({
      description:
        'Status transitions currently allowed by the backend state machine.',
      example: ['in_progress'],
    }),
    blockedTransitions: z.array(BlockedObligationTransitionSchema).openapi({
      description:
        'Transitions intentionally blocked by backend business rules, including the reason.',
      example: [{ status: 'submitted', reason: 'document_required' }],
    }),
    statusHistory: z.array(ObligationStatusChangeSchema).openapi({
      description: 'Persisted status-change audit trail for this obligation.',
    }),
  })
  .openapi('ObligationResponse', {
    description: 'Public obligation API response with sensitive fields masked.',
  });

export const ObligationIdParamsSchema = z
  .object({
    id: z.uuid(),
  })
  .openapi('ObligationIdParams');

export const UpdateObligationStatusSchema = z
  .object({
    status: ObligationStatusSchema,
    expectedVersion: ExpectedVersionSchema,
  })
  .openapi('UpdateObligationStatusRequest', {
    description: 'Request body for changing an obligation status.',
  });

export type ObligationModel = z.infer<typeof ObligationSchema>;
export type CreateObligationModel = z.infer<typeof CreateObligationSchema>;
export type UpdateObligationModel = z.infer<typeof UpdateObligationSchema>;
export type ObligationResponseModel = z.infer<typeof ObligationResponseSchema>;
export type UpdateObligationStatusModel = z.infer<
  typeof UpdateObligationStatusSchema
>;
