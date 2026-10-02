import * as XLSX from 'xlsx';
import type { Line } from '../types';

export interface ParsedRow {
  /** Número de fila en el Excel, para que el usuario la ubique */
  row: number;
  sku: string;
  cantidad: number | null;
  error?: string;
  warning?: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  /** Problema que impide usar el archivo */
  fatal?: string;
}

const norm = (v: unknown) => String(v ?? '').trim().toLowerCase();
const HEADER_SEARCH_ROWS = 20;

/** Busca "sku" y "cantidad" en la primera hoja y arma las filas. Síncrono: lo corre el worker. */
export function parseWorkbook(buffer: ArrayBuffer): ParseResult {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet || !sheet['!ref']) return { rows: [], fatal: 'La primera hoja está vacía.' };

  const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: true, defval: '' });
  const firstRow = XLSX.utils.decode_range(sheet['!ref']).s.r; // fila (base 0) donde empieza la hoja

  let headerAt = -1;
  let itemCol = -1;
  let qtyCol = -1;
  for (let i = 0; i < Math.min(grid.length, HEADER_SEARCH_ROWS); i++) {
    const cells = grid[i].map(norm);
    const it = cells.indexOf('sku');
    const q = cells.indexOf('cantidad');
    if (it >= 0 && q >= 0) {
      headerAt = i;
      itemCol = it;
      qtyCol = q;
      break;
    }
  }
  if (headerAt < 0) {
    return { rows: [], fatal: 'No encontré las columnas "sku" y "cantidad" en la primera hoja.' };
  }

  const rows: ParsedRow[] = [];
  const seen = new Map<string, number>();

  for (let i = headerAt + 1; i < grid.length; i++) {
    const rawQty = grid[i][qtyCol];
    const sku = String(grid[i][itemCol] ?? '').trim();
    const qtyText = String(rawQty ?? '').trim();
    if (!sku && !qtyText) continue; // fila vacía

    const row: ParsedRow = { row: firstRow + i + 1, sku, cantidad: null };

    if (!sku) row.error = 'Falta el sku.';
    else if (!qtyText) row.error = 'Falta la cantidad.';
    else {
      const qty = typeof rawQty === 'number' ? rawQty : Number(qtyText);
      if (!Number.isInteger(qty) || qty <= 0) row.error = 'La cantidad debe ser un entero mayor a 0.';
      else row.cantidad = qty;
    }

    if (!row.error) {
      const first = seen.get(sku);
      if (first) row.warning = `Repetido: ya aparece en la fila ${first}.`;
      else seen.set(sku, row.row);
    }
    rows.push(row);
  }

  if (rows.length === 0) return { rows, fatal: 'No hay líneas debajo del encabezado.' };
  return { rows };
}

/** Filas válidas -> líneas para el XML. */
export function toLines(rows: ParsedRow[]): Line[] {
  return rows.flatMap((r) => (r.cantidad !== null && !r.error ? [{ sku: r.sku, cantidad: r.cantidad }] : []));
}
