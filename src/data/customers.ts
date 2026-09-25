import raw from './customers.json';
import type { Customer } from '../types';

export const customers = raw as Customer[];

/** Avisos sobre datos del customer. No bloquean la generación. */
export function customerIssues(c: Customer): string[] {
  const out: string[] = [];
  if (!c.category2) out.push('Category2 está vacío.');
  if (!/^\d{5}$/.test(c.shipTo.postalCode)) out.push('El código postal no tiene 5 dígitos.');
  if (!c.shipTo.address1) out.push('Falta la dirección (Address1).');
  return out;
}

/** Busca por nombre exacto (sin importar mayúsculas) o por número de tienda. */
export function findCustomer(input: string): Customer | undefined {
  const q = input.trim().toLowerCase();
  if (!q) return undefined;
  return customers.find((c) => c.code.toLowerCase() === q || c.storeNo === q);
}
