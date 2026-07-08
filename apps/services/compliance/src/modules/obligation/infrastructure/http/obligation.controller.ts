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
import type { Obligation } from '@repo/types';
import { ObligationEntity } from '../../domain/obligation.entity';
import {
  CreateObligationSchema,
  ObligationSchema,
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
  ): Promise<Obligation> {
    const entity = await this.obligationService.getById(id);
    return entity.toDTO();
  }

  @Post()
  async create(
    @Body() body: unknown,
  ): Promise<Obligation> {
    const obligation = parseBody(CreateObligationSchema, body);
    const entity = ObligationEntity.create(obligation);
    const created = await this.obligationService.create(entity);
    return created.toDTO();
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<string> {
    await this.obligationService.delete(id);
    return 'Obligation deleted'
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<Obligation> {
    const obligation = parseBody(ObligationSchema, body);
    const entity = ObligationEntity.from({ ...obligation, id });
    const updated = await this.obligationService.update(id, entity);
    return updated.toDTO();
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<Obligation> {
    const { status: obligationStatus } = parseBody(
      UpdateObligationStatusSchema,
      body,
    );
    const entity =  await this.obligationService.updateStatus(id, obligationStatus);
    return entity.toDTO();
  }
}
