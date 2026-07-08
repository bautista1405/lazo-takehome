import { randomUUID } from 'crypto';
import type {
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

const validTransitions: Record<ObligationStatus, readonly ObligationStatus[]> = {
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

  static from(
    props: Obligation,
    statusHistory: ObligationStatusChange[] = [],
  ) {
    return new ObligationEntity(props, statusHistory);
  }

  static create(props: CreateObligationModel) {
    return new ObligationEntity({
      ...props,
      id: randomUUID(),
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
      statusHistory: this.statusHistory,
    };
  }

  isOverdue(now = new Date()): boolean {
    return new Date(this.props.dueDate) < now && this.props.status !== 'done';
  }

  updateDetails(updates: UpdateObligationModel): ObligationEntity {
    const { expectedVersion: _expectedVersion, ...changes } = updates;

    return new ObligationEntity({
      ...this.props,
      ...changes,
    }, this.statusHistory);
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

    return new ObligationEntity({
      ...this.props,
      status,
    }, this.statusHistory);
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

  private hasRequiredDocument(): boolean {
    return (
      !this.props.requiresDocument ||
      Boolean(this.props.documentUrl?.trim())
    );
  }

  private isValidStatusStep(status: ObligationStatus): boolean {
    return validTransitions[this.props.status].includes(status);
  }
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
