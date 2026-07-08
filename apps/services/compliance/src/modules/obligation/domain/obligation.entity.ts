import { randomUUID } from 'crypto';
import type {
  BlockedObligationTransition,
  Obligation,
  ObligationResponse,
  ObligationStatus,
  ObligationStatusChange,
} from '@repo/types';
import {
  DocumentRequiredForSubmissionError,
  InvalidStatusTransitionError,
} from './obligation.errors';
import type {
  CreateObligationModel,
  UpdateObligationModel,
} from './models/obligationModel';

const validTransitions: Record<ObligationStatus, readonly ObligationStatus[]> =
  {
    pending: ['in_progress'],
    in_progress: ['submitted', 'pending'],
    submitted: ['done', 'in_progress'],
    done: ['in_progress'],
  };

export class ObligationEntity {
  private constructor(
    private readonly props: Obligation,
    private readonly statusHistory: ObligationStatusChange[] = [],
  ) {}

  static from(props: Obligation, statusHistory: ObligationStatusChange[] = []) {
    return new ObligationEntity(props, statusHistory);
  }

  static create(props: CreateObligationModel) {
    return new ObligationEntity({
      ...props,
      id: randomUUID(),
      status: 'pending',
      version: 1,
    });
  }

  toDTO(): Obligation {
    return this.props;
  }

  toResponse(now = new Date()): ObligationResponse {
    const { companyTaxId, ...publicProps } = this.props;

    return {
      ...publicProps,
      maskedCompanyTaxId: maskCompanyTaxId(companyTaxId),
      overdue: this.isOverdue(now),
      allowedTransitions: this.allowedTransitions(),
      blockedTransitions: this.blockedTransitions(),
      statusHistory: this.statusHistory,
    };
  }

  isOverdue(now = new Date()): boolean {
    return new Date(this.props.dueDate) < now && this.props.status !== 'done';
  }

  updateDetails(updates: UpdateObligationModel): ObligationEntity {
    const { expectedVersion, ...changes } = updates;
    void expectedVersion;
    const nextProps = {
      ...this.props,
      ...changes,
    };

    if (
      nextProps.status === 'submitted' &&
      !hasRequiredDocument(nextProps.requiresDocument, nextProps.documentUrl)
    ) {
      throw new DocumentRequiredForSubmissionError();
    }

    return new ObligationEntity(nextProps, this.statusHistory);
  }

  withStatus(status: Obligation['status']): ObligationEntity {
    if (!this.isValidStatusStep(status)) {
      throw new InvalidStatusTransitionError({
        from: this.props.status,
        to: status,
        allowedTransitions: this.allowedTransitions(),
      });
    }

    if (status === 'submitted' && !this.hasRequiredDocument()) {
      throw new DocumentRequiredForSubmissionError();
    }

    return new ObligationEntity(
      {
        ...this.props,
        status,
      },
      this.statusHistory,
    );
  }

  canTransitionTo(status: ObligationStatus): boolean {
    if (!this.isValidStatusStep(status)) {
      return false;
    }

    return status !== 'submitted' || this.hasRequiredDocument();
  }

  allowedTransitions(): ObligationStatus[] {
    return validTransitions[this.props.status].filter((status) =>
      this.canTransitionTo(status),
    );
  }

  blockedTransitions(): BlockedObligationTransition[] {
    return validTransitions[this.props.status].flatMap((status) => {
      if (status === 'submitted' && !this.hasRequiredDocument()) {
        return [{ status, reason: 'document_required' }];
      }

      return [];
    });
  }

  private hasRequiredDocument(): boolean {
    return hasRequiredDocument(
      this.props.requiresDocument,
      this.props.documentUrl,
    );
  }

  private isValidStatusStep(status: ObligationStatus): boolean {
    return validTransitions[this.props.status].includes(status);
  }
}

function hasRequiredDocument(
  requiresDocument: boolean,
  documentUrl: string | null | undefined,
): boolean {
  return !requiresDocument || Boolean(documentUrl?.trim());
}

function maskCompanyTaxId(companyTaxId: string): string {
  const digitCount = [...companyTaxId].filter((character) =>
    /\d/.test(character),
  ).length;

  if (digitCount <= 4) {
    return '****';
  }

  let visibleDigits = 0;

  return [...companyTaxId]
    .reverse()
    .map((character) => {
      if (!/\d/.test(character)) {
        return character;
      }

      visibleDigits += 1;

      return visibleDigits <= 4 ? character : '*';
    })
    .reverse()
    .join('');
}
