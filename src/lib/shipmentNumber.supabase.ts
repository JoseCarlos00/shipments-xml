import { supabase } from './supabaseClient';
import type { ShipmentNumberService } from './shipmentNumber';

interface ShipmentNumberResponse {
  num: number;
}

/** Llama a la Edge Function "shipment_number", que reserva el número de forma atómica. */
export const supabaseShipmentNumbers: ShipmentNumberService = {
  async next(customerId) {
    const { data, error } = await supabase.functions.invoke<ShipmentNumberResponse>('shipment_number', {
      body: { customerId },
    });
    if (error) throw error;
    if (!data || typeof data.num !== 'number') {
      throw new Error('Respuesta inválida del servicio de numeración.');
    }
    return data.num;
  },
};
