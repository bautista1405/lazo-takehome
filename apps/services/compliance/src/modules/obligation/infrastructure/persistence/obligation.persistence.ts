import type { Obligation } from '@repo/types';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

const obligationTypes = [
  'annual_report',
  'franchise_tax',
  'boi_report',
  'registered_agent_renewal',
] as const;

const obligationStatuses = [
  'pending',
  'in_progress',
  'submitted',
  'done',
] as const;

@Entity({ name: 'obligations' })
export class ObligationPersistence {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: obligationTypes })
  type!: Obligation['type'];

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: obligationStatuses })
  status!: Obligation['status'];

  @Column({ type: 'date' })
  dueDate!: string;

  @Column()
  owner!: string;

  @Column()
  requiresDocument!: boolean;

  @Column()
  companyTaxId!: string;

  @UpdateDateColumn()
  updatedAt!: Date;

  @VersionColumn()
  version!: number;
}
