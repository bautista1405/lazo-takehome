import type { ObligationStatus } from '@repo/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  ObligationPersistence,
  obligationStatuses,
} from './obligation.persistence';

@Entity({ name: 'obligation_status_changes' })
export class ObligationStatusChangePersistence {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  obligationId!: string;

  @ManyToOne(() => ObligationPersistence, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'obligationId' })
  obligation!: ObligationPersistence;

  @Column({ type: 'enum', enum: obligationStatuses })
  fromStatus!: ObligationStatus;

  @Column({ type: 'enum', enum: obligationStatuses })
  toStatus!: ObligationStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  changedAt!: Date;
}
