export interface Customer {
  /** Clave del contador en Supabase, ej. "store-4753" */
  id: string;
  /** UserDef8 y primer bloque del ShipmentId, ej. "4753" */
  storeNo: string;
  /**
   * Customer.Customer = ShipTo = CustomerAddress.Name = ShipToAddress.Name,
   * ej. "Coa-Torreon". También genera el comentario (en MAYÚSCULAS).
   */
  code: string;
  /** OrderType = Category1 */
  orderType: 'TDMX' | 'TDFOR';
  /** Category2, ej. "STG TORREON"*/
  category2: string;
  /** Category10: "101".."105" */
  category10: string;
  shipTo: {
    address1: string;
    address2: string;
    address3: string;
    /** Ojo: en tus XML este campo trae el estado (ej. "Coahuila"), no la ciudad */
    city: string;
    state: string;
    /** Siempre string de 5 dígitos: hay CPs con cero inicial (06060) */
    postalCode: string;
  };
}

/** Fila del Excel */
export interface Line {
  sku: string;
  cantidad: number;
}
