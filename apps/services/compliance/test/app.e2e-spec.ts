import { BadRequestException, ConflictException } from '@nestjs/common';
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

  findAll(): Promise<ObligationEntity[]> {
    return Promise.resolve(
      [...this.obligations.values()]
        .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
        .map((obligation) => this.toEntity(obligation)),
    );
  }

  findById(id: string): Promise<ObligationEntity | null> {
    const obligation = this.obligations.get(id);

    return Promise.resolve(obligation ? this.toEntity(obligation) : null);
  }

  findByCompanyTaxId(companyTaxId: string): Promise<ObligationEntity | null> {
    const obligation = [...this.obligations.values()].find(
      (item) => item.companyTaxId === companyTaxId,
    );

    return Promise.resolve(obligation ? this.toEntity(obligation) : null);
  }

  save(obligation: ObligationEntity): Promise<ObligationEntity> {
    const dto = obligation.toDTO();
    this.obligations.set(dto.id, dto);
    this.statusHistory.set(dto.id, []);

    return Promise.resolve(this.toEntity(dto));
  }

  delete(id: string): Promise<boolean> {
    this.statusHistory.delete(id);

    return Promise.resolve(this.obligations.delete(id));
  }

  update(
    id: string,
    obligation: ObligationEntity,
    expectedVersion: number,
  ): Promise<ObligationEntity | null> {
    const existing = this.obligations.get(id);

    if (!existing) {
      return Promise.resolve(null);
    }

    this.assertVersion(id, existing.version, expectedVersion);

    const next = {
      ...obligation.toDTO(),
      id,
      version: existing.version + 1,
    };

    this.obligations.set(id, next);

    return Promise.resolve(this.toEntity(next));
  }

  updateStatus(
    id: string,
    status: Obligation['status'],
    expectedVersion: number,
  ): Promise<ObligationEntity | null> {
    const existing = this.obligations.get(id);

    if (!existing) {
      return Promise.resolve(null);
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
    this.statusHistory.set(id, [...(this.statusHistory.get(id) ?? []), entry]);

    return Promise.resolve(this.toEntity(nextDto));
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

  it('blocks submitted status when required document evidence is missing', async () => {
    const created = await createObligation(controller, {
      requiresDocument: true,
      documentUrl: null,
    });
    const inProgress = await controller.updateStatus(created.id, {
      status: 'in_progress',
      expectedVersion: created.version,
    });

    try {
      await controller.updateStatus(inProgress.id, {
        status: 'submitted',
        expectedVersion: inProgress.version,
      });
      throw new Error('Expected document-gated status update to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).getResponse()).toMatchObject({
        statusCode: 400,
        status: 'document_required',
        details: {
          targetStatus: 'submitted',
          requiredField: 'documentUrl',
        },
      });
    }
  });

  it('allows submitted status without document evidence when it is not required', async () => {
    const created = await createObligation(controller, {
      requiresDocument: false,
      documentUrl: null,
    });
    const inProgress = await controller.updateStatus(created.id, {
      status: 'in_progress',
      expectedVersion: created.version,
    });

    const submitted = await controller.updateStatus(inProgress.id, {
      status: 'submitted',
      expectedVersion: inProgress.version,
    });

    expect(submitted.status).toBe('submitted');
    expect(submitted.documentUrl).toBeNull();
    expect(submitted.requiresDocument).toBe(false);
  });

  it('blocks clearing the document url after submission', async () => {
    const created = await createObligation(controller);
    const inProgress = await controller.updateStatus(created.id, {
      status: 'in_progress',
      expectedVersion: created.version,
    });
    const submitted = await controller.updateStatus(inProgress.id, {
      status: 'submitted',
      expectedVersion: inProgress.version,
    });

    try {
      await controller.update(submitted.id, {
        expectedVersion: submitted.version,
        documentUrl: null,
      });
      throw new Error('Expected submitted document removal to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).getResponse()).toMatchObject({
        statusCode: 400,
        status: 'document_required',
        details: {
          targetStatus: 'submitted',
          requiredField: 'documentUrl',
        },
      });
    }
  });
});

function createObligation(
  controller: ObligationController,
  overrides: Partial<
    Omit<Obligation, 'id' | 'version' | 'status' | 'companyTaxId'>
  > = {},
): Promise<ObligationResponse> {
  return controller.create({
    type: 'annual_report',
    title: 'File annual report',
    description: 'Submit the annual report before the state deadline.',
    dueDate: '2026-08-15',
    owner: 'Legal Ops',
    requiresDocument: true,
    documentUrl: 'https://example.com/documents/annual-report.pdf',
    companyTaxId: '12-3456789',
    ...overrides,
  });
}
