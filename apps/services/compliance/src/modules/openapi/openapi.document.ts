import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  CreateObligationSchema,
  ObligationIdParamsSchema,
  ObligationSchema,
  UpdateObligationStatusSchema,
} from '../obligation/domain/models/obligationModel';

const registry = new OpenAPIRegistry();

const ErrorResponseSchema = registry.register(
  'ErrorResponse',
  z.object({
    message: z.string(),
    error: z.string().optional(),
    statusCode: z.number().optional(),
  }),
);

registry.register('Obligation', ObligationSchema);
registry.register('CreateObligationRequest', CreateObligationSchema);
registry.register('UpdateObligationStatusRequest', UpdateObligationStatusSchema);

registry.registerPath({
  method: 'get',
  path: '/obligation/{id}',
  summary: 'Get an obligation by id',
  request: {
    params: ObligationIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Obligation found.',
      content: {
        'application/json': {
          schema: ObligationSchema,
        },
      },
    },
    404: {
      description: 'Obligation not found.',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/obligation',
  summary: 'Create an obligation',
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: CreateObligationSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Obligation created.',
      content: {
        'application/json': {
          schema: ObligationSchema,
        },
      },
    },
    400: {
      description: 'Invalid request body.',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/obligation/{id}',
  summary: 'Update an obligation',
  request: {
    params: ObligationIdParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: ObligationSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Obligation updated.',
      content: {
        'application/json': {
          schema: ObligationSchema,
        },
      },
    },
    400: {
      description: 'Invalid request body.',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Obligation not found.',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/obligation/{id}/status',
  summary: 'Change an obligation status',
  request: {
    params: ObligationIdParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: UpdateObligationStatusSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Obligation status updated.',
      content: {
        'application/json': {
          schema: ObligationSchema,
        },
      },
    },
    400: {
      description: 'Invalid status transition or invalid request body.',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Obligation not found.',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export function generateOpenApiDocument(): unknown {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Compliance Obligations API',
      version: '0.1.0',
    },
    servers: [
      {
        url: 'http://localhost:3002',
      },
    ],
  });
}
