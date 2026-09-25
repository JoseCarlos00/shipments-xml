/** Valores fijos en xml's */
export const XML = {
  action: 'Save',
  userDef6: 'CAMIONETA FM',
  userDef13: '--',
  allocateComplete: 'N',
  consolidationAllowed: 'Y',
  commentType: 'Comentario1',
  carrier: 'Camioneta FM',
  carrierService: 'Camioneta FM',
  company: 'FM',
  category8: 'N',
  country: 'MX',
  warehouse: 'Mariano',
  uom: 'PZ',
} as const;

/** Partes fijas del shipment_id: PREFIJO+TIENDA-TIPO-PRIORIDAD-NUM */
export const SHIPMENT_TYPE = 'T';
export const PRIORITY = '999';

/** TODO: confirmar con el sistema principal que acepta este prefijo */
export const ID_PREFIX = 'W';

/** TODO: primer número de tu rango. El servicio arranca aquí para no chocar con los otros dos sistemas. */
export const FIRST_NUM = 2_000_000;
