import { Module } from '@nestjs/common';
import { ObligationModule } from './modules/obligation/obligation.module';

@Module({
  imports: [
    ObligationModule
  ],
})
export class AppModule {}
