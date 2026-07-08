import type { ObligationStatus } from '@repo/types';

export type ObligationDomainErrorStatus =
  | 'invalid_status_transition'
  | 'document_required';

export type ObligationDomainErrorResponse = {
  status: ObligationDomainErrorStatus;
  message: string;
  details?: Record<string, unknown>;
};

export abstract class ObligationDomainError extends Error {
  abstract readonly status: ObligationDomainErrorStatus;
  abstract readonly details?: Record<string, unknown>;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toResponse(): ObligationDomainErrorResponse {
    return {
      status: this.status,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

export class InvalidStatusTransitionError extends ObligationDomainError {
  readonly status = 'invalid_status_transition';
  readonly details: {
    from: ObligationStatus;
    to: ObligationStatus;
    allowedTransitions: ObligationStatus[];
  };

  constructor(params: {
    from: ObligationStatus;
    to: ObligationStatus;
    allowedTransitions: ObligationStatus[];
  }) {
    super(`Cannot transition obligation from ${params.from} to ${params.to}.`);
    this.details = params;
  }
}

export class DocumentRequiredForSubmissionError extends ObligationDomainError {
  readonly status = 'document_required';
  readonly details = {
    targetStatus: 'submitted',
    requiredField: 'documentUrl',
  };

  constructor() {
    super('Attach a document before submitting this obligation.');
  }
}
