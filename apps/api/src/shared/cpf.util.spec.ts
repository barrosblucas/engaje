import { cleanCpf, formatCpf, validateCpf } from './cpf.util';

describe('validateCpf', () => {
  it('valida CPFs corretos', () => {
    expect(validateCpf('52998224725')).toBe(true);
    expect(validateCpf('11144477735')).toBe(true);
  });

  it('rejeita CPFs com dígitos repetidos', () => {
    expect(validateCpf('00000000000')).toBe(false);
    expect(validateCpf('11111111111')).toBe(false);
  });

  it('rejeita CPFs com dígitos verificadores errados', () => {
    expect(validateCpf('12345678900')).toBe(false);
  });

  it('rejeita CPFs com formato errado', () => {
    expect(validateCpf('123')).toBe(false);
    expect(validateCpf('1234567890a')).toBe(false);
  });
});

describe('cleanCpf', () => {
  it('remove formatação', () => {
    expect(cleanCpf('529.982.247-25')).toBe('52998224725');
  });
});

describe('formatCpf', () => {
  it('formata CPF corretamente', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
  });
});
