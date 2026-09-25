import { FIRST_NUM } from '../constants';

/**
 * Contrato del contador. La app solo conoce esto.
 * Implementaciones: local (temporal) y Supabase (después).
 */
export interface ShipmentNumberService {
  /** Reserva y devuelve el siguiente número del customer. Llamar solo al generar. */
  next(customerId: string): Promise<number>;
}

const KEY = 'shipmentCounter:';

/** Temporal: un contador por customer en este navegador. No se comparte entre equipos. */
export const localShipmentNumbers: ShipmentNumberService = {
  async next(customerId) {
    const key = KEY + customerId;
    const stored = Number(localStorage.getItem(key));
    const last = Number.isInteger(stored) && stored >= FIRST_NUM ? stored : FIRST_NUM - 1;
    const n = last + 1;
    localStorage.setItem(key, String(n));
    return n;
  },
};
