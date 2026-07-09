import pino from 'pino';
import { REDACT_PATHS } from './logging.config';

describe('log redaction', () => {
  it('never writes companyTaxId values to log output', () => {
    const lines: string[] = [];
    const logger = pino(
      { redact: REDACT_PATHS },
      {
        write: (line: string) => {
          lines.push(line);
        },
      },
    );
    const companyTaxId = '12-3456789';

    logger.info({ companyTaxId }, 'top-level field');
    logger.info({ obligation: { companyTaxId } }, 'nested in an object');
    logger.info({ req: { body: { companyTaxId } } }, 'request body');

    const output = lines.join('');

    expect(lines).toHaveLength(3);
    expect(output).not.toContain(companyTaxId);
    expect(output).toContain('[Redacted]');
  });
});
