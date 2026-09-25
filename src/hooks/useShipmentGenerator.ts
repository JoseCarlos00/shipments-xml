import { useMemo, useState } from 'react';
import { customerIssues, customers, findCustomer } from '../data/customers';
import { buildXml, formatOrderDate } from '../lib/buildXml';
import { downloadText } from '../lib/download';
import { parseExcel, toLines, type ParseResult } from '../lib/parseExcel';
import { buildFileNameShipmentId } from '../lib/shipmentId';
import { shipmentNumbers } from '../lib/services';

export interface Generated {
  customer: string;
  shipmentId: string;
  filename: string;
  xml: string;
  lineCount: number;
}

/** Toda la lógica de la pantalla: carga de Excel, selección de customer y generación del XML. */
export function useShipmentGenerator() {
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [customerInput, setCustomerInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState<Generated | null>(null);

  const customer = findCustomer(customerInput);
  const issues = customer ? customerIssues(customer) : [];
  const rows = parsed?.rows ?? [];
  const errorCount = rows.filter((r) => r.error).length;
  const warningCount = rows.filter((r) => !r.error && r.warning).length;
  const lines = useMemo(() => (parsed ? toLines(parsed.rows) : []), [parsed]);
  const totalQty = lines.reduce((sum, l) => sum + l.cantidad, 0);

  let blocker = '';
  if (!parsed || parsed.fatal) blocker = 'Carga un Excel con líneas.';
  else if (errorCount > 0) blocker = `Corrige ${errorCount} ${errorCount === 1 ? 'fila con error' : 'filas con error'} en el Excel y cárgalo de nuevo.`;
  else if (!customer) blocker = 'Elige un customer.';
  const canGenerate = !blocker && !busy;

  async function loadFile(file: File | undefined) {
    if (!file) return;
    setError('');
    setGenerated(null);
    setFileName(file.name);
    try {
      setParsed(await parseExcel(file));
    } catch {
      setParsed(null);
      setError('No pude leer el archivo. Verifica que sea un Excel (.xlsx o .xls) o un CSV.');
    }
  }

  async function generate() {
    if (!customer || !canGenerate) return;
    setBusy(true);
    setError('');
    try {
      // El número se pide solo aquí, al generar (no en la vista previa)
      const num = await shipmentNumbers.next(customer.id);
      const xml = buildXml(customer, lines, { num, orderDate: formatOrderDate() });
      const fileNmeShipmentId = buildFileNameShipmentId(customer.storeNo, num);
      const filename = fileNmeShipmentId;
      downloadText(filename, xml);
      setGenerated({ customer: customer.code, shipmentId: fileNmeShipmentId, filename, xml, lineCount: lines.length });
    } catch {
      setError('No se pudo generar el XML. Si aparece un número de pedido usado, anótalo antes de reintentar.');
    } finally {
      setBusy(false);
    }
  }

  function redownload() {
    if (generated) downloadText(generated.filename, generated.xml);
  }

  return {
    customers,
    fileName,
    rows,
    parsedFatal: parsed?.fatal,
    hasParsed: parsed !== null,
    customerInput,
    setCustomerInput,
    customer,
    issues,
    errorCount,
    warningCount,
    lineCount: lines.length,
    totalQty,
    blocker,
    canGenerate,
    busy,
    error,
    generated,
    loadFile,
    generate,
    redownload,
  };
}
