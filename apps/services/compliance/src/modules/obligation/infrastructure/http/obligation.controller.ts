import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ObligationService } from '../../application/obligation.service';

@Controller('obligation')
export class ObligationController {
  constructor(private readonly obligationService: ObligationService) {}

  @Get()
  get(): string {
    return this.obligationService.getObligation();
  }

  @Post()
  create(): string {
    return this.obligationService.createObligation();
  }

  @Delete()
  delete(): string {
    return this.obligationService.deleteObligation();
  }

  @Patch()
  update(): string {
    return this.obligationService.updateObligation();
  }

  @Patch('/status')
  updateStatus(): string {
    return this.obligationService.updateObligationStatus();
  }
}
