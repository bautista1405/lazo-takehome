import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import type { Obligation } from '@repo/types';
import { ObligationService } from './modules/obligation/application/services/obligation.service';
import { ObligationEntity } from './modules/obligation/domain/obligation.entity';
import { ObligationController } from './modules/obligation/infrastructure/http/obligation.controller';

describe('ObligationController', () => {
  let controller: ObligationController;
  let obligationService: {
    list: jest.Mock;
    getById: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
    update: jest.Mock;
    updateStatus: jest.Mock;
  };

  const obligation: Obligation = {
    id: '8a3a4e8f-9a84-42dd-8c1f-e6b6edc7d04b',
    version: 1,
    type: 'annual_report',
    title: 'File annual report',
    description: 'Submit the annual report before the state deadline.',
    status: 'pending',
    dueDate: '2026-08-15',
    owner: 'Legal Ops',
    requiresDocument: true,
    documentUrl: 'https://example.com/documents/annual-report.pdf',
    companyTaxId: '12-3456789',
  };

  beforeEach(async () => {
    obligationService = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [ObligationController],
      providers: [
        {
          provide: ObligationService,
          useValue: obligationService,
        },
      ],
    }).compile();

    controller = app.get<ObligationController>(ObligationController);
  });

  describe('module wiring', () => {
    it('creates the controller', () => {
      expect(controller).toBeDefined();
    });
  });

  it('returns a masked public response when creating an obligation', async () => {
    obligationService.create.mockResolvedValue(
      ObligationEntity.from(obligation),
    );

    const response = await controller.create({
      type: obligation.type,
      title: obligation.title,
      description: obligation.description,
      dueDate: obligation.dueDate,
      owner: obligation.owner,
      requiresDocument: obligation.requiresDocument,
      documentUrl: obligation.documentUrl,
      companyTaxId: obligation.companyTaxId,
    });

    expect(response).not.toHaveProperty('companyTaxId');
    expect(response.maskedCompanyTaxId).toBe('**-***6789');
    expect(response.documentUrl).toBe(obligation.documentUrl);
    expect(response.version).toBe(1);
    expect(response.statusHistory).toEqual([]);
  });

  it('returns masked public responses when listing obligations', async () => {
    obligationService.list.mockResolvedValue([
      ObligationEntity.from(obligation),
    ]);

    const response = await controller.list();

    expect(response).toHaveLength(1);
    expect(response[0]).not.toHaveProperty('companyTaxId');
    expect(response[0]?.maskedCompanyTaxId).toBe('**-***6789');
  });

  it('rejects status changes through the detail update endpoint', async () => {
    await expect(
      controller.update(obligation.id, {
        expectedVersion: obligation.version,
        status: 'submitted',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('requires expectedVersion when changing status', async () => {
    await expect(
      controller.updateStatus(obligation.id, {
        status: 'in_progress',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
