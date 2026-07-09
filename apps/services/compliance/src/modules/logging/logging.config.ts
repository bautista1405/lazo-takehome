import type { Params } from 'nestjs-pino';

export const REDACT_PATHS = [
  'companyTaxId',
  '*.companyTaxId',
  'req.body.companyTaxId',
];

export const loggerConfig: Params = {
  pinoHttp: {
    redact: REDACT_PATHS,
    autoLogging: {
      ignore: (req) => req.url === '/health',
    },
  },
};
