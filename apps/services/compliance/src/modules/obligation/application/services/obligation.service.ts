import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OBLIGATION_REPOSITORY } from '../ports/obligation.token';
import type { IObligationRepository } from '../ports/obligation-repository.interface';
import { ObligationEntity } from '../../domain/obligation.entity';

@Injectable()
export class ObligationService {
  constructor(
    @Inject(OBLIGATION_REPOSITORY)
    private readonly obligationRepository: IObligationRepository,
  ) {}

  async getById(id: string): Promise<ObligationEntity | null> {
    const obligation = await this.obligationRepository.findById(id);

    if (!obligation) {
      throw new NotFoundException('Obligation not found');
    }
    return obligation;
  }

  async create(obligation: ObligationEntity): Promise<ObligationEntity> {
    return await this.obligationRepository.save(obligation);
  }

  async update(id: string): Promise<ObligationEntity | null> {
    const obligation = await this.obligationRepository.update(id);

    if (!obligation) {
      throw new NotFoundException('Obligation not found');
    }
    return obligation;
  }

  async delete(id: string): Promise<string> {
    const obligation = await this.obligationRepository.delete(id);

    if (!obligation) {
      throw new NotFoundException('Obligation not found');
    }
    return 'Obligation deleted';
  }

  async updateStatus(id: string): Promise<ObligationEntity | null> {
    const obligation = await this.obligationRepository.updateStatus(id);

    if (!obligation) {
      throw new NotFoundException('Obligation not found');
    }
    return obligation;
  }
}
