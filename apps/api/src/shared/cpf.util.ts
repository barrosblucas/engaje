/**
 * Valida CPF brasileiro pelos dígitos verificadores.
 * Recebe CPF sem formatação (11 dígitos).
 */
export function validateCpf(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf)) return false;

  // Rejeita sequências repetidas (ex: 00000000000)
  if (/^(\d)\1+$/.test(cpf)) return false;

  const calcDigit = (digits: string, length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 || remainder === 11 ? 0 : remainder;
  };

  const firstDigit = calcDigit(cpf, 9);
  const secondDigit = calcDigit(cpf, 10);

  return Number(cpf[9]) === firstDigit && Number(cpf[10]) === secondDigit;
}

/** Remove formatação do CPF, deixando apenas dígitos. */
export function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/** Formata CPF para exibição: XXX.XXX.XXX-XX */
export function formatCpf(cpf: string): string {
  const digits = cleanCpf(cpf);
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
