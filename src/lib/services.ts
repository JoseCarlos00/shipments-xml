import { localShipmentNumbers, type ShipmentNumberService } from './shipmentNumber';

/** Único punto donde se elige la implementación. Al conectar Supabase, cambia solo esta línea. */
export const shipmentNumbers: ShipmentNumberService = localShipmentNumbers;
