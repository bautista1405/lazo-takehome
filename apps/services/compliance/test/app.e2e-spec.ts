import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type {
  Obligation,
  ObligationResponse,
  ObligationStatusChange,
} from '@repo/types';
import type { IObligationRepository } from '../src/modules/obligation/application/ports/obligation-repository.interface';
import { OBLIGATION_REPOSITORY } from '../src/modules/obligation/application/ports/obligation.token';
import { ObligationService } from '../src/modules/obligation/application/services/obligation.service';
import { ObligationEntity } from '../src/modules/obligation/domain/obligation.entity';
import { ObligationVersionConflictError } from '../src/modules/obligation/domain/obligation.errors';
import { ObligationController } from '../src/modules/obligation/infrastructure/http/obligation.controller';

class InMemoryObligationRepository implements IObligationRepository {
  private readonly obligations = new Map<string, Obligation>();
  private readonly statusHistory = new Map<string, ObligationStatusChange[]>();
  private statusHistorySequence = 1;

  async findById(id: string): Promise<ObligationEntity | null> {
    const obligation = this.obligations.get(id);

    return obligation ? this.toEntity(obligation) : null;
  }

  async findByCompanyTaxId(
    companyTaxId: string,
  ): Promise<ObligationEntity | null> {
    const obligation = [...this.obligations.values()].find(
      (item) => item.companyTaxId === companyTaxId,
    );

    return obligation ? this.toEntity(obligation) : null;
  }

  async save(obligation: ObligationEntity): Promise<ObligationEntity> {
    const dto = obligation.toDTO();
    this.obligations.set(dto.id, dto);
    this.statusHistory.set(dto.id, []);

    return this.toEntity(dto);
  }

  async delete(id: string): Promise<boolean> {
    this.statusHistory.delete(id);

    return this.obligations.delete(id);
  }

  async update(
    id: string,
    obligation: ObligationEntity,
    expectedVersion: number,
  ): Promise<ObligationEntity | null> {
    const existing = this.obligations.get(id);

    if (!existing) {
      return null;
    }

    this.assertVersion(id, existing.version, expectedVersion);

    const next = {
      ...obligation.toDTO(),
      id,
      version: existing.version + 1,
    };

    this.obligations.set(id, next);

    return this.toEntity(next);
  }

  async updateStatus(
    id: string,
    status: Obligation['status'],
    expectedVersion: number,
  ): Promise<ObligationEntity | null> {
    const existing = this.obligations.get(id);

    if (!existing) {
      return null;
    }

    this.assertVersion(id, existing.version, expectedVersion);

    const next = ObligationEntity.from(
      existing,
      this.statusHistory.get(id) ?? [],
    ).withStatus(status);
    const nextDto = {
      ...next.toDTO(),
      version: existing.version + 1,
    };
    const entry = this.createStatusHistoryEntry(existing, nextDto);

    this.obligations.set(id, nextDto);
    this.statusHistory.set(id, [
      ...(this.statusHistory.get(id) ?? []),
      entry,
    ]);

    return this.toEntity(nextDto);
  }

  private toEntity(obligation: Obligation): ObligationEntity {
    return ObligationEntity.from(
      obligation,
      this.statusHistory.get(obligation.id) ?? [],
    );
  }

  private assertVersion(
    obligationId: string,
    currentVersion: number,
    expectedVersion: number,
  ): void {
    if (currentVersion !== expectedVersion) {
      throw new ObligationVersionConflictError({
        obligationId,
        expectedVersion,
        currentVersion,
      });
    }
  }

  private createStatusHistoryEntry(
    from: Obligation,
    to: Obligation,
  ): ObligationStatusChange {
    const sequence = this.statusHistorySequence++;

    return {
      id: `00000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`,
      obligationId: from.id,
      fromStatus: from.status,
      toStatus: to.status,
      changedAt: '2026-07-08T15:30:00.000Z',
    };
  }
}

describe('Obligation application flow (e2e)', () => {
  let controller: ObligationController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ObligationController],
      providers: [
        ObligationService,
        {
          provide: OBLIGATION_REPOSITORY,
          useClass: InMemoryObligationRepository,
        },
      ],
    }).compile();

    controller = moduleFixture.get(ObligationController);
  });

  it('creates obligations without leaking company tax ids', async () => {
    const response = await createObligation(controller);

    expect(response).not.toHaveProperty('companyTaxId');
    expect(response.maskedCompanyTaxId).toBe('**-***6789');
    expect(response.version).toBe(1);
    expect(response.statusHistory).toEqual([]);
  });

  it('updates status with an audit entry and a new version', async () => {
    const created = await createObligation(controller);

    const response = await controller.updateStatus(created.id, {
      status: 'in_progress',
      expectedVersion: created.version,
    });

    expect(response.status).toBe('in_progress');
    expect(response.version).toBe(2);
    expect(response.statusHistory).toMatchObject([
      {
        obligationId: created.id,
        fromStatus: 'pending',
        toStatus: 'in_progress',
      },
    ]);
  });

  it('rejects stale status updates', async () => {
    const created = await createObligation(controller);

    await controller.updateStatus(created.id, {
      status: 'in_progress',
      expectedVersion: created.version,
    });

    try {
      await controller.updateStatus(created.id, {
        status: 'submitted',
        expectedVersion: created.version,
      });
      throw new Error('Expected stale update to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      expect((error as ConflictException).getResponse()).toMatchObject({
        statusCode: 409,
        status: 'version_conflict',
        details: {
          expectedVersion: 1,
          currentVersion: 2,
        },
      });
    }
  });
});

function createObligation(
  controller: ObligationController,
): Promise<ObligationResponse> {
  return controller.create({
    type: 'annual_report',
    title: 'File annual report',
    description: 'Submit the annual report before the state deadline.',
    status: 'pending',
    dueDate: '2026-08-15',
    owner: 'Legal Ops',
    requiresDocument: true,
    documentUrl: 'https://example.com/documents/annual-report.pdf',
    companyTaxId: '12-3456789',
  });
}
