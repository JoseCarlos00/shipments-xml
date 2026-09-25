import { PRIORITY, SHIPMENT_TYPE } from '../constants';

/**
 * Sirve para ShipmentId y para el ErpOrder del encabezado.
 * "4753-T-111-12743" (con prefijo: "W4753-T-111-12743")
 */
export function buildShipmentId(storeNo: string, num: number): string {
  return `${storeNo}-${SHIPMENT_TYPE}-${PRIORITY}-${num}`;
}

/** ErpOrder de cada línea (Details): "4753-12743". Sin sufijo ni prefijo. */
export function buildDetailErpOrder(storeNo: string, num: number): string {
  return `${storeNo}-${num}`;
}
