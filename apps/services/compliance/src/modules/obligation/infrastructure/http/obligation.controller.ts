import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ObligationService } from '../../application/services/obligation.service';
import type { ObligationResponse } from '@repo/types';
import { ObligationEntity } from '../../domain/obligation.entity';
import {
  CreateObligationSchema,
  UpdateObligationSchema,
  UpdateObligationStatusSchema,
} from '../../domain/models/obligationModel';
import { z, ZodError } from 'zod';

function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException({
        message: 'Invalid request body',
        issues: error.issues,
      });
    }

    throw error;
  }
}

@Controller('obligation')
export class ObligationController {
  constructor(private readonly obligationService: ObligationService) {}

  @Get(':id')
  async get(
    @Param('id') id: string,
  ): Promise<ObligationResponse> {
    const entity = await this.obligationService.getById(id);
    return entity.toResponse();
  }

  @Post()
  async create(
    @Body() body: unknown,
  ): Promise<ObligationResponse> {
    const obligation = parseBody(CreateObligationSchema, body);
    const entity = ObligationEntity.create(obligation);
    const created = await this.obligationService.create(entity);
    return created.toResponse();
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<string> {
    await this.obligationService.delete(id);
    return 'Obligation deleted';
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<ObligationResponse> {
    const updates = parseBody(UpdateObligationSchema, body);
    const existing = await this.obligationService.getById(id);
    const entity = existing.updateDetails(updates);
    const updated = await this.obligationService.update(id, entity);
    return updated.toResponse();
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<ObligationResponse> {
    const { status: obligationStatus } = parseBody(
      UpdateObligationStatusSchema,
      body,
    );
    const entity = await this.obligationService.updateStatus(id, obligationStatus);
    return entity.toResponse();
  }
}
