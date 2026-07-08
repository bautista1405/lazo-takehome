import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObligationModule } from './modules/obligation/obligation.module';
import { OpenApiController } from './openapi.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      username: process.env.POSTGRES_USER ?? 'compliance',
      password: process.env.POSTGRES_PASSWORD ?? 'compliance',
      database: process.env.POSTGRES_DB ?? 'compliance',
      autoLoadEntities: true,
      synchronize: process.env.TYPEORM_SYNCHRONIZE !== 'false',
    }),
    ObligationModule,
  ],
  controllers: [OpenApiController],
})
export class AppModule {}
