import { describe, expect, it } from 'vitest';
import { PUBLIC_FOOTER_SOCIAL_LINKS } from './public-footer-links';

describe('public-footer-links', () => {
  it('exposes official social links and website URL', () => {
    expect(PUBLIC_FOOTER_SOCIAL_LINKS.facebook).toBe(
      'https://www.facebook.com/PrefeituraBandeirantesMS',
    );
    expect(PUBLIC_FOOTER_SOCIAL_LINKS.instagram).toBe(
      'https://www.instagram.com/prefbandeirantes.ms/',
    );
    expect(PUBLIC_FOOTER_SOCIAL_LINKS.website).toBe('https://bandeirantes.ms.gov.br/v2/');
  });

  it('does not keep deprecated WhatsApp shortcut URL', () => {
    expect(Object.values(PUBLIC_FOOTER_SOCIAL_LINKS)).not.toContain('https://wa.me/5567999990000');
  });
});
