import { describe, expect, it } from 'vitest';
import {
  buildFacebookShareUrl,
  buildPublicShareUrl,
  buildWhatsappShareUrl,
  resolvePublicWebBaseUrl,
} from './public-share';

describe('public-share', () => {
  it('resolves public app url from NEXT_PUBLIC_APP_URL', () => {
    const result = resolvePublicWebBaseUrl({
      NEXT_PUBLIC_APP_URL: ' https://engaje.bandeirantesms.app.br/ ',
    });

    expect(result).toBe('https://engaje.bandeirantesms.app.br');
  });

  it('falls back to localhost when NEXT_PUBLIC_APP_URL is missing', () => {
    const result = resolvePublicWebBaseUrl({});

    expect(result).toBe('http://localhost:3100');
  });

  it('falls back to localhost when NEXT_PUBLIC_APP_URL is invalid', () => {
    const result = resolvePublicWebBaseUrl({
      NEXT_PUBLIC_APP_URL: 'engaje.bandeirantesms.app.br',
    });

    expect(result).toBe('http://localhost:3100');
  });

  it('builds absolute public share url', () => {
    const result = buildPublicShareUrl('/public/eventos/corrida-da-mulher', {
      NEXT_PUBLIC_APP_URL: 'https://engaje.bandeirantesms.app.br',
    });

    expect(result).toBe('https://engaje.bandeirantesms.app.br/public/eventos/corrida-da-mulher');
  });

  it('builds WhatsApp share url with encoded title and link', () => {
    const result = buildWhatsappShareUrl({
      title: '1ª Corrida Dia Internacional da Mulher',
      url: 'https://engaje.bandeirantesms.app.br/public/eventos/1a-corrida',
    });

    expect(result).toContain('https://wa.me/?text=');
    expect(result).toContain(
      encodeURIComponent(
        '1ª Corrida Dia Internacional da Mulher https://engaje.bandeirantesms.app.br/public/eventos/1a-corrida',
      ),
    );
  });

  it('builds Facebook share url with encoded target url', () => {
    const result = buildFacebookShareUrl(
      'https://engaje.bandeirantesms.app.br/public/programas/juventude-digital',
    );

    expect(result).toBe(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://engaje.bandeirantesms.app.br/public/programas/juventude-digital')}`,
    );
  });
});
