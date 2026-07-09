import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { HealthModule } from './modules/health/health.module';
import { loggerConfig } from './modules/logging/logging.config';
import { ObligationModule } from './modules/obligation/obligation.module';
import { OpenApiModule } from './modules/openapi/openapi.module';

function databaseConfig(): TypeOrmModuleOptions {
  const connection = process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_SSL === 'true',
      }
    : {
        host: process.env.POSTGRES_HOST ?? 'localhost',
        port: Number(process.env.POSTGRES_PORT ?? 5432),
        username: process.env.POSTGRES_USER ?? 'compliance',
        password: process.env.POSTGRES_PASSWORD ?? 'compliance',
        database: process.env.POSTGRES_DB ?? 'compliance',
      };

  return {
    type: 'postgres',
    ...connection,
    autoLoadEntities: true,
    synchronize: process.env.TYPEORM_SYNCHRONIZE !== 'false',
  };
}

@Module({
  imports: [
    LoggerModule.forRoot(loggerConfig),
    TypeOrmModule.forRoot(databaseConfig()),
    HealthModule,
    ObligationModule,
    OpenApiModule,
  ],
})
export class AppModule {}
