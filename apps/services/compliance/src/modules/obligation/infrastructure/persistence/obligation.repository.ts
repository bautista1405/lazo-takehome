import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { Obligation } from '@repo/types';
import type { IObligationRepository } from '../../application/ports/obligation-repository.interface';
import { ObligationEntity } from '../../domain/obligation.entity';
import { ObligationVersionConflictError } from '../../domain/obligation.errors';
import { ObligationMapper } from './obligation.mapper';
import { ObligationStatusChangePersistence } from './obligation-status-change.persistence';
import { ObligationPersistence } from './obligation.persistence';

@Injectable()
export class TypeOrmObligationRepository implements IObligationRepository {
  constructor(
    @InjectRepository(ObligationPersistence)
    private readonly repository: Repository<ObligationPersistence>,
    @InjectRepository(ObligationStatusChangePersistence)
    private readonly statusChangeRepository: Repository<ObligationStatusChangePersistence>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<ObligationEntity | null> {
    const row = await this.repository.findOneBy({ id });

    if (!row) {
      return null;
    }

    const statusHistory = await this.findStatusHistory(id);

    return ObligationMapper.toDomain(row, statusHistory);
  }

  async findByCompanyTaxId(
    companyTaxId: string,
  ): Promise<ObligationEntity | null> {
    const row = await this.repository.findOneBy({ companyTaxId });

    if (!row) {
      return null;
    }

    const statusHistory = await this.findStatusHistory(row.id);

    return ObligationMapper.toDomain(row, statusHistory);
  }

  async save(obligation: ObligationEntity): Promise<ObligationEntity> {
    const row = ObligationMapper.toPersistence(obligation);
    const saved = await this.repository.save(row);

    return ObligationMapper.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });

    return Boolean(result.affected);
  }

  async update(
    id: string,
    obligation: ObligationEntity,
    expectedVersion: number,
  ): Promise<ObligationEntity | null> {
    const existing = await this.repository.findOneBy({ id });

    if (!existing) {
      return null;
    }

    if (existing.version !== expectedVersion) {
      throw new ObligationVersionConflictError({
        obligationId: id,
        expectedVersion,
        currentVersion: existing.version,
      });
    }

    const next = obligation.toDTO();
    const result = await this.repository
      .createQueryBuilder()
      .update(ObligationPersistence)
      .set({
        type: next.type,
        title: next.title,
        description: next.description,
        dueDate: next.dueDate,
        owner: next.owner,
        requiresDocument: next.requiresDocument,
        documentUrl: next.documentUrl ?? null,
        companyTaxId: next.companyTaxId,
        version: () => 'version + 1',
      })
      .where('id = :id', { id })
      .andWhere('version = :expectedVersion', { expectedVersion })
      .execute();

    if (!result.affected) {
      throw await this.createVersionConflictError(id, expectedVersion);
    }

    return this.findById(id);
  }

  async updateStatus(
    id: string,
    status: Obligation['status'],
    expectedVersion: number,
  ): Promise<ObligationEntity | null> {
    return this.dataSource.transaction(async (manager) => {
      const obligationRepository = manager.getRepository(ObligationPersistence);
      const statusChangeRepository = manager.getRepository(
        ObligationStatusChangePersistence,
      );
      const existing = await obligationRepository.findOneBy({ id });

      if (!existing) {
        return null;
      }

      if (existing.version !== expectedVersion) {
        throw new ObligationVersionConflictError({
          obligationId: id,
          expectedVersion,
          currentVersion: existing.version,
        });
      }

      ObligationMapper.toDomain(existing).withStatus(status);

      const result = await obligationRepository
        .createQueryBuilder()
        .update(ObligationPersistence)
        .set({
          status,
          version: () => 'version + 1',
        })
        .where('id = :id', { id })
        .andWhere('version = :expectedVersion', { expectedVersion })
        .execute();

      if (!result.affected) {
        throw await this.createVersionConflictError(
          id,
          expectedVersion,
          obligationRepository,
        );
      }

      await statusChangeRepository.save(
        statusChangeRepository.create({
          obligationId: id,
          fromStatus: existing.status,
          toStatus: status,
        }),
      );

      const updated = await obligationRepository.findOneByOrFail({ id });
      const statusHistory = await this.findStatusHistory(
        id,
        statusChangeRepository,
      );

      return ObligationMapper.toDomain(updated, statusHistory);
    });
  }

  private async findStatusHistory(
    obligationId: string,
    repository = this.statusChangeRepository,
  ): Promise<ObligationStatusChangePersistence[]> {
    return repository.find({
      where: { obligationId },
      order: {
        changedAt: 'ASC',
      },
    });
  }

  private async createVersionConflictError(
    obligationId: string,
    expectedVersion: number,
    repository = this.repository,
  ): Promise<ObligationVersionConflictError> {
    const current = await repository.findOneBy({ id: obligationId });

    return new ObligationVersionConflictError({
      obligationId,
      expectedVersion,
      currentVersion: current?.version,
    });
  }
}
