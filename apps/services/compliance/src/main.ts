import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { generateOpenApiDocument } from './modules/openapi/openapi.document';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  SwaggerModule.setup('docs', app, generateOpenApiDocument() as never, {
    jsonDocumentUrl: 'openapi.json',
  });

  await app.listen(process.env.PORT ?? 3002);
}
void bootstrap();
