import {
  generateOpenApiDocument,
  resolveOpenApiServerUrl,
} from './openapi.document';

describe('OpenAPI document', () => {
  it('uses localhost for local development', () => {
    expect(resolveOpenApiServerUrl({})).toBe('http://localhost:3002');
  });

  it('uses the configured public server url without trailing slashes', () => {
    expect(
      resolveOpenApiServerUrl({
        NODE_ENV: 'production',
        OPENAPI_SERVER_URL: 'https://api.example.com///',
      }),
    ).toBe('https://api.example.com');
  });

  it('falls back to same-origin in production instead of localhost', () => {
    expect(resolveOpenApiServerUrl({ NODE_ENV: 'production' })).toBe('/');
  });

  it('emits the resolved server url in the generated document', () => {
    const previousOpenApiServerUrl = process.env.OPENAPI_SERVER_URL;

    process.env.OPENAPI_SERVER_URL = 'https://api.example.com/';

    try {
      expect(generateOpenApiDocument()).toMatchObject({
        servers: [{ url: 'https://api.example.com' }],
      });
    } finally {
      if (previousOpenApiServerUrl === undefined) {
        delete process.env.OPENAPI_SERVER_URL;
      } else {
        process.env.OPENAPI_SERVER_URL = previousOpenApiServerUrl;
      }
    }
  });
});
