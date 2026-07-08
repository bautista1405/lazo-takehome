import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Obligation } from '@repo/types';
import type { IObligationRepository } from '../../application/ports/obligation-repository.interface';
import { ObligationEntity } from '../../domain/obligation.entity';
import { ObligationMapper } from './obligation.mapper';
import { ObligationPersistence } from './obligation.persistence';

@Injectable()
export class TypeOrmObligationRepository implements IObligationRepository {
  constructor(
    @InjectRepository(ObligationPersistence)
    private readonly repository: Repository<ObligationPersistence>,
  ) {}

  async findById(id: string): Promise<ObligationEntity | null> {
    const row = await this.repository.findOneBy({ id });

    return row ? ObligationMapper.toDomain(row) : null;
  }

  async findByCompanyTaxId(
    companyTaxId: string,
  ): Promise<ObligationEntity | null> {
    const row = await this.repository.findOneBy({ companyTaxId });

    return row ? ObligationMapper.toDomain(row) : null;
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
  ): Promise<ObligationEntity | null> {
    const existing = await this.repository.findOneBy({ id });

    if (!existing) {
      return null;
    }

    const row = ObligationMapper.toPersistence(obligation);
    row.id = id;
    const saved = await this.repository.save(row);

    return ObligationMapper.toDomain(saved);
  }

  async updateStatus(
    id: string,
    status: Obligation['status'],
  ): Promise<ObligationEntity | null> {
    const existing = await this.findById(id);

    if (!existing) {
      return null;
    }

    return this.update(id, existing.withStatus(status));
  }
}
