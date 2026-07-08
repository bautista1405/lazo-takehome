import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OBLIGATION_REPOSITORY } from '../ports/obligation.token';
import type { IObligationRepository } from '../ports/obligation-repository.interface';
import { ObligationEntity } from '../../domain/obligation.entity';
import { ObligationDomainError } from '../../domain/obligation.errors';
import { Obligation } from '@repo/types';

@Injectable()
export class ObligationService {
  constructor(
    @Inject(OBLIGATION_REPOSITORY)
    private readonly obligationRepository: IObligationRepository,
  ) {}

  async getById(id: string): Promise<ObligationEntity> {
    const obligation = await this.obligationRepository.findById(id);

    if (!obligation) {
      throw new NotFoundException('Obligation not found');
    }
    return obligation;
  }

  async create(obligation: ObligationEntity): Promise<ObligationEntity> {
    return await this.obligationRepository.save(obligation);
  }

  async update(
    id: string,
    obligation: ObligationEntity,
  ): Promise<ObligationEntity> {
    const existingObligation = await this.obligationRepository.update(
      id,
      obligation,
    );

    if (!existingObligation) {
      throw new NotFoundException('Obligation not found');
    }
    return existingObligation;
  }

  async delete(id: string): Promise<string> {
    const obligation = await this.obligationRepository.delete(id);

    if (!obligation) {
      throw new NotFoundException('Obligation not found');
    }
    return 'Obligation deleted';
  }

  async updateStatus(
    id: string,
    status: Obligation['status'],
  ): Promise<ObligationEntity> {
    const obligation = await this.mapDomainErrors(() =>
      this.obligationRepository.updateStatus(id, status),
    );

    if (!obligation) {
      throw new NotFoundException('Obligation not found');
    }
    return obligation;
  }

  private async mapDomainErrors<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ObligationDomainError) {
        throw new BadRequestException({
          statusCode: 400,
          ...error.toResponse(),
        });
      }

      throw error;
    }
  }
}
