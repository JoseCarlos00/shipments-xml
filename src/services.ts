import { supabaseShipmentNumbers } from './lib/shipmentNumber.supabase';
import { localShipmentNumbers } from './lib/shipmentNumber'; // fallback temporal, sin Supabase
import type { ShipmentNumberService } from './lib/shipmentNumber';


export const shipmentNumbers: ShipmentNumberService = import.meta.env.DEV
	? localShipmentNumbers
	: supabaseShipmentNumbers;
