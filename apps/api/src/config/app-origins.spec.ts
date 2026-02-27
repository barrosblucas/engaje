import {
  createCorsOriginValidator,
  getAllowedAppOrigins,
  getPrimaryAppOrigin,
  isAppOriginAllowed,
} from './app-origins';

describe('app-origins config', () => {
  it('prioriza APP_URLS quando informado', () => {
    const origins = getAllowedAppOrigins({
      APP_URL: 'http://localhost:3100',
      APP_URLS: 'http://localhost:3100, http://192.168.1.21:3100/, http://localhost:3100',
      NODE_ENV: 'production',
    });

    expect(origins).toEqual(['http://localhost:3100', 'http://192.168.1.21:3100']);
  });

  it('usa APP_URL como fallback quando APP_URLS não existe', () => {
    const origins = getAllowedAppOrigins({
      APP_URL: 'http://my-web.test:3100/',
      APP_URLS: undefined,
      NODE_ENV: 'production',
    });

    expect(origins).toEqual(['http://my-web.test:3100']);
    expect(
      getPrimaryAppOrigin({ APP_URL: 'http://my-web.test:3100/', NODE_ENV: 'production' }),
    ).toBe('http://my-web.test:3100');
  });

  it('permite origin de rede local em desenvolvimento', () => {
    const isAllowed = isAppOriginAllowed('http://192.168.1.21:3100', {
      APP_URL: 'http://localhost:3100',
      APP_URLS: undefined,
      NODE_ENV: 'development',
    });

    expect(isAllowed).toBe(true);
  });

  it('bloqueia origin de rede local em produção quando não configurado', () => {
    const isAllowed = isAppOriginAllowed('http://192.168.1.21:3100', {
      APP_URL: 'http://localhost:3100',
      APP_URLS: undefined,
      NODE_ENV: 'production',
    });

    expect(isAllowed).toBe(false);
  });

  it('bloqueia origin externo não confiável', () => {
    const isAllowed = isAppOriginAllowed('https://attacker.example', {
      APP_URL: 'http://localhost:3100',
      APP_URLS: 'http://localhost:3100',
      NODE_ENV: 'development',
    });

    expect(isAllowed).toBe(false);
  });

  it('retorna erro no validador CORS para origin não permitido', () => {
    const validator = createCorsOriginValidator({
      APP_URL: 'http://localhost:3100',
      APP_URLS: undefined,
      NODE_ENV: 'production',
    });

    const callback = jest.fn();
    validator('https://attacker.example', callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error));
  });
});
