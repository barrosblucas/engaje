import { createId } from '@paralleldrive/cuid2';
import { format } from 'date-fns';

/** Gera número de protocolo para inscrição em evento: EVT-YYYYMMDD-XXXXX */
export function generateEventProtocol(): string {
  const dateStr = format(new Date(), 'yyyyMMdd');
  const suffix = createId().slice(0, 5).toUpperCase();
  return `EVT-${dateStr}-${suffix}`;
}

/** Gera número de protocolo para inscrição em programa: PRG-YYYYMMDD-XXXXX */
export function generateProgramProtocol(): string {
  const dateStr = format(new Date(), 'yyyyMMdd');
  const suffix = createId().slice(0, 5).toUpperCase();
  return `PRG-${dateStr}-${suffix}`;
}
