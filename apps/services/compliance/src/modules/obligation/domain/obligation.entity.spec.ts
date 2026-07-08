import type { Obligation } from '@repo/types';
import {
  DocumentRequiredForSubmissionError,
  InvalidStatusTransitionError,
} from './obligation.errors';
import { ObligationEntity } from './obligation.entity';

const baseObligation = (overrides: Partial<Obligation> = {}): Obligation => ({
  id: '8a3a4e8f-9a84-42dd-8c1f-e6b6edc7d04b',
  version: 1,
  type: 'annual_report',
  title: 'File annual report',
  description: 'Submit the annual report before the state deadline.',
  status: 'in_progress',
  dueDate: '2026-08-15',
  owner: 'Legal Ops',
  requiresDocument: true,
  documentUrl: null,
  companyTaxId: '12-3456789',
  ...overrides,
});

describe('ObligationEntity', () => {
  it('blocks submitted status when a required document is missing', () => {
    const obligation = ObligationEntity.from(baseObligation());

    expect(() => obligation.withStatus('submitted')).toThrow(
      DocumentRequiredForSubmissionError,
    );
    expect(obligation.allowedTransitions()).not.toContain('submitted');
  });

  it('reports invalid status transitions separately from document failures', () => {
    const obligation = ObligationEntity.from(
      baseObligation({
        status: 'pending',
      }),
    );

    expect(() => obligation.withStatus('submitted')).toThrow(
      InvalidStatusTransitionError,
    );
  });

  it('allows submitted status when a required document is attached', () => {
    const obligation = ObligationEntity.from(
      baseObligation({
        documentUrl: 'https://example.com/documents/annual-report.pdf',
      }),
    );

    expect(obligation.withStatus('submitted').toDTO().status).toBe('submitted');
    expect(obligation.allowedTransitions()).toContain('submitted');
  });

  it('masks company tax id in public responses', () => {
    const obligation = ObligationEntity.from(baseObligation());
    const response = obligation.toResponse(new Date('2026-07-01'));

    expect(response).not.toHaveProperty('companyTaxId');
    expect(response.maskedCompanyTaxId).toBe('**-***6789');
  });

  it('includes status history in public responses', () => {
    const obligation = ObligationEntity.from(baseObligation(), [
      {
        id: '5a8fc174-f691-4b14-a71a-71f24c14a0cb',
        obligationId: '8a3a4e8f-9a84-42dd-8c1f-e6b6edc7d04b',
        fromStatus: 'pending',
        toStatus: 'in_progress',
        changedAt: '2026-07-08T15:30:00.000Z',
      },
    ]);
    const response = obligation.toResponse(new Date('2026-07-01'));

    expect(response.statusHistory).toEqual([
      {
        id: '5a8fc174-f691-4b14-a71a-71f24c14a0cb',
        obligationId: '8a3a4e8f-9a84-42dd-8c1f-e6b6edc7d04b',
        fromStatus: 'pending',
        toStatus: 'in_progress',
        changedAt: '2026-07-08T15:30:00.000Z',
      },
    ]);
  });
});
