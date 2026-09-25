import { supabaseShipmentNumbers } from './lib/shipmentNumber.supabase';
// import { localShipmentNumbers } from './lib/shipmentNumber'; // fallback temporal, sin Supabase
import type { ShipmentNumberService } from './lib/shipmentNumber';

/** Único punto donde se elige la implementación. */
export const shipmentNumbers: ShipmentNumberService = supabaseShipmentNumbers;
