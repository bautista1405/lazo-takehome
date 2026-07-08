import { randomUUID } from 'crypto';
import type { Obligation, ObligationStatus } from '@repo/types';
import type { CreateObligationModel } from './models/obligationModel';

const validTransitions: Record<ObligationStatus, readonly ObligationStatus[]> = {
  pending: ['in_progress'],
  in_progress: ['submitted', 'pending'],
  submitted: ['done', 'in_progress'],
  done: ['in_progress'],
};

export class ObligationEntity {
  private constructor(
    private readonly props: Obligation
) {}

  static from(props: Obligation) {
    return new ObligationEntity(props);
  }

  static create(props: CreateObligationModel) {
    return new ObligationEntity({
      ...props,
      id: randomUUID(),
    });
  }

  toDTO(): Obligation {
    return this.props;
  }

  isOverdue(now = new Date()): boolean {
    return new Date(this.props.dueDate) < now && this.props.status !== 'done';
  }

  withStatus(status: Obligation['status']): ObligationEntity {
    if (!this.canTransitionTo(status)) {
      throw new Error(
        `Invalid status transition from ${this.props.status} to ${status}`
      );
    }

    if (
      status === 'submitted' &&
      this.props.requiresDocument
    ) {
      throw new Error(
        'Document is required before submitting this obligation'
      );
    }

    return new ObligationEntity({
      ...this.props,
      status,
    });
  }

  canTransitionTo(status: ObligationStatus): boolean {
    return validTransitions[this.props.status].includes(status);
  }
}
