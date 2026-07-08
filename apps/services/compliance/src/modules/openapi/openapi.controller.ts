import { Controller, Get } from '@nestjs/common';
import { generateOpenApiDocument } from './openapi.document';

@Controller()
export class OpenApiController {
  @Get('openapi.json')
  getOpenApiDocument(): unknown {
    return generateOpenApiDocument();
  }
}
