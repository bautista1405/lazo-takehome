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
  it('blocks submitted status when document evidence is missing', () => {
    const obligation = ObligationEntity.from(baseObligation());

    expect(() => obligation.withStatus('submitted')).toThrow(
      DocumentRequiredForSubmissionError,
    );
    expect(obligation.allowedTransitions()).not.toContain('submitted');
    expect(obligation.blockedTransitions()).toEqual([
      {
        status: 'submitted',
        reason: 'document_required',
      },
    ]);
  });

  it('allows submitted status without document evidence when it is not required', () => {
    const obligation = ObligationEntity.from(
      baseObligation({
        requiresDocument: false,
        documentUrl: null,
      }),
    );

    expect(obligation.withStatus('submitted').toDTO().status).toBe('submitted');
    expect(obligation.allowedTransitions()).toContain('submitted');
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

  it('blocks removing document evidence from a submitted obligation', () => {
    const obligation = ObligationEntity.from(
      baseObligation({
        status: 'submitted',
        documentUrl: 'https://example.com/documents/annual-report.pdf',
      }),
    );

    expect(() =>
      obligation.updateDetails({
        expectedVersion: 1,
        documentUrl: null,
      }),
    ).toThrow(DocumentRequiredForSubmissionError);
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

  describe('isOverdue', () => {
    it('is not overdue on the due date and becomes overdue the day after', () => {
      const obligation = ObligationEntity.from(
        baseObligation({ status: 'in_progress', dueDate: '2026-07-07' }),
      );

      expect(obligation.isOverdue(new Date('2026-07-07T23:59:59Z'))).toBe(
        false,
      );
      expect(obligation.isOverdue(new Date('2026-07-08T00:00:00Z'))).toBe(true);
    });

    it('marks past-due pending and in_progress obligations as overdue', () => {
      for (const status of ['pending', 'in_progress'] as const) {
        const obligation = ObligationEntity.from(
          baseObligation({ status, dueDate: '2026-01-01' }),
        );

        expect(obligation.isOverdue(new Date('2026-07-08T12:00:00Z'))).toBe(
          true,
        );
      }
    });

    it('never marks submitted or done obligations as overdue', () => {
      for (const status of ['submitted', 'done'] as const) {
        const obligation = ObligationEntity.from(
          baseObligation({
            status,
            dueDate: '2026-01-01',
            documentUrl: 'https://example.com/documents/annual-report.pdf',
          }),
        );

        expect(obligation.isOverdue(new Date('2026-07-08T12:00:00Z'))).toBe(
          false,
        );
      }
    });
  });
});
