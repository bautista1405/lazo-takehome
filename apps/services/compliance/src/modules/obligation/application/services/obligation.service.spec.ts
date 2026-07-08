import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OBLIGATION_REPOSITORY } from '../ports/obligation.token';
import {
  DocumentRequiredForSubmissionError,
  ObligationVersionConflictError,
} from '../../domain/obligation.errors';
import { ObligationService } from './obligation.service';

describe('ObligationService', () => {
  it('maps obligation rule violations to bad request errors', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObligationService,
        {
          provide: OBLIGATION_REPOSITORY,
          useValue: {
            updateStatus: jest
              .fn()
              .mockRejectedValue(new DocumentRequiredForSubmissionError()),
          },
        },
      ],
    }).compile();

    const service = module.get(ObligationService);

    try {
      await service.updateStatus(
        '8a3a4e8f-9a84-42dd-8c1f-e6b6edc7d04b',
        'submitted',
        1,
      );
      throw new Error('Expected updateStatus to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).getResponse()).toEqual({
        statusCode: 400,
        status: 'document_required',
        message: 'Attach a document before submitting this obligation.',
        details: {
          targetStatus: 'submitted',
          requiredField: 'documentUrl',
        },
      });
    }
  });

  it('maps stale version errors to conflict responses', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObligationService,
        {
          provide: OBLIGATION_REPOSITORY,
          useValue: {
            updateStatus: jest.fn().mockRejectedValue(
              new ObligationVersionConflictError({
                obligationId: '8a3a4e8f-9a84-42dd-8c1f-e6b6edc7d04b',
                expectedVersion: 1,
                currentVersion: 2,
              }),
            ),
          },
        },
      ],
    }).compile();

    const service = module.get(ObligationService);

    try {
      await service.updateStatus(
        '8a3a4e8f-9a84-42dd-8c1f-e6b6edc7d04b',
        'submitted',
        1,
      );
      throw new Error('Expected updateStatus to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      expect((error as ConflictException).getResponse()).toEqual({
        statusCode: 409,
        status: 'version_conflict',
        message:
          'The obligation changed since it was last read. Refresh and retry.',
        details: {
          obligationId: '8a3a4e8f-9a84-42dd-8c1f-e6b6edc7d04b',
          expectedVersion: 1,
          currentVersion: 2,
        },
      });
    }
  });
});
