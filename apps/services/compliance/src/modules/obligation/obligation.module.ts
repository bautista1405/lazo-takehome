import { Module } from '@nestjs/common';
import { ObligationController } from './infrastructure/http/obligation.controller';
import { ObligationService } from './application/obligation.service';

@Module({
  imports: [],
  controllers: [ObligationController],
  providers: [ObligationService],
})
export class ObligationModule {}