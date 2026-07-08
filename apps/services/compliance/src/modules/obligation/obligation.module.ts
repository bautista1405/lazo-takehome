import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObligationController } from './infrastructure/http/obligation.controller';
import { ObligationService } from './application/services/obligation.service';
import { OBLIGATION_REPOSITORY } from './application/ports/obligation.token';
import { ObligationPersistence } from './infrastructure/persistence/obligation.persistence';
import { TypeOrmObligationRepository } from './infrastructure/persistence/obligation.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ObligationPersistence])],
  controllers: [ObligationController],
  providers: [
    ObligationService,
    {
      provide: OBLIGATION_REPOSITORY,
      useClass: TypeOrmObligationRepository,
    },
  ],
})
export class ObligationModule {}
