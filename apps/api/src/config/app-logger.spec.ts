import { createAppLogger, resolveLogLevel } from './app-logger';

describe('app-logger', () => {
  it('usa log level debug por padrão em desenvolvimento', () => {
    expect(resolveLogLevel({ NODE_ENV: 'development' })).toBe('debug');
    expect(createAppLogger({ NODE_ENV: 'development' }).level).toBe('debug');
  });

  it('usa log level info por padrão em produção', () => {
    expect(resolveLogLevel({ NODE_ENV: 'production' })).toBe('info');
    expect(createAppLogger({ NODE_ENV: 'production' }).level).toBe('info');
  });

  it('respeita LOG_LEVEL quando informado', () => {
    expect(resolveLogLevel({ NODE_ENV: 'development', LOG_LEVEL: 'trace' })).toBe('trace');
    expect(createAppLogger({ NODE_ENV: 'development', LOG_LEVEL: 'trace' }).level).toBe('trace');
  });
});
