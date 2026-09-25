import { useMemo, useState } from 'react';
import { customerIssues, customers, findCustomer } from './data/customers';
import { buildXml, formatOrderDate } from './lib/buildXml';
import { downloadText } from './lib/download';
import { parseExcel, toLines, type ParseResult } from './lib/parseExcel';
import { buildFileNameShipmentId } from './lib/shipmentId';
import { shipmentNumbers } from './lib/services';

interface Generated {
  customer: string;
  shipmentId: string;
  filename: string;
  xml: string;
  lineCount: number;
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 15V4M12 4 8 8M12 4l4 4" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

export default function App() {
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [customerInput, setCustomerInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [dragging, setDragging] = useState(false);

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
      const shipmentIdFileName = buildFileNameShipmentId(customer.storeNo, num);
      const filename = shipmentIdFileName;
      downloadText(filename, xml);
      setGenerated({ customer: customer.code, shipmentId: shipmentIdFileName, filename, xml, lineCount: lines.length });
    } catch {
      setError('No se pudo generar el XML. Si aparece un número de pedido usado, anótalo antes de reintentar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-4 px-4 py-3 sm:px-6">
          <h1 className="text-lg font-semibold">Shipments XML</h1>
          <p className="text-sm text-muted">{customers.length} customers cargados</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl bg-panel lg:grid lg:min-h-128 lg:grid-cols-[24rem_1fr] lg:border-x lg:border-line">
        <section className="space-y-6 border-b border-line p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <div>
            <h2 className="mb-2 text-sm font-medium">Excel</h2>
            <label
              htmlFor="excel"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                void loadFile(e.dataTransfer.files[0]);
              }}
              className={`flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed px-4 py-8 text-center transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-signal ${
                dragging ? 'border-signal bg-signal/10' : fileName ? 'border-line bg-floor' : 'border-muted hover:border-signal hover:bg-signal/5'
              }`}
            >
              <input
                id="excel"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="sr-only"
                onChange={(e) => {
                  void loadFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <span className={fileName ? 'text-ok' : 'text-signal'}>{fileName ? <FileIcon /> : <UploadIcon />}</span>
              {fileName ? (
                <>
                  <span className="break-all text-sm font-medium">{fileName}</span>
                  <span className="text-xs text-muted">Suelta otro archivo o haz clic para cambiarlo</span>
                </>
              ) : (
                <>
                  <span className="text-base font-semibold">Suelta el Excel aquí</span>
                  <span className="text-sm text-muted">o haz clic para elegirlo — columnas item y qty</span>
                </>
              )}
            </label>
          </div>

          <div>
            <label htmlFor="customer" className="mb-2 block text-sm font-medium">
              Customer
            </label>
            <input
              id="customer"
              list="customer-list"
              value={customerInput}
              onChange={(e) => setCustomerInput(e.target.value)}
              autoComplete="off"
              placeholder="Nombre o número de tienda"
              className="w-full border border-line bg-floor px-3 py-2 text-sm placeholder:text-muted focus:outline-2 focus:outline-offset-1 focus:outline-signal"
            />
            <datalist id="customer-list">
              {customers.map((c) => (
                <option key={c.id} value={c.code} label={c.storeNo} />
              ))}
            </datalist>

            {customer && (
              <p className="mt-2 text-sm text-muted">
                Tienda {customer.storeNo}, {customer.orderType}
                <br />
                {customer.shipTo.address1}, {customer.shipTo.address3}
              </p>
            )}
            {customerInput.trim() && !customer && (
              <p className="mt-2 text-sm text-danger">No encontré ese customer. Elígelo de la lista.</p>
            )}
            {issues.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm text-warn">
                {issues.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => void generate()}
              disabled={!canGenerate}
              className="w-full bg-signal px-4 py-3 text-sm font-semibold text-floor hover:bg-signal-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed disabled:bg-line disabled:text-muted cursor-pointer"
            >
              {busy ? 'Generando…' : 'Generar y descargar XML'}
            </button>
            {blocker && <p className="mt-2 text-sm text-muted">{blocker}</p>}
            {error && (
              <p role="alert" className="mt-2 text-sm text-danger">
                {error}
              </p>
            )}
          </div>

          <div aria-live="polite">
            {generated && (
              <div className="border-l-4 border-ok bg-ok-dim p-3">
                <p className="text-sm font-medium text-ok">XML descargado</p>
                <p className="mt-1 break-all font-mono text-lg font-semibold tabular-nums">{generated.shipmentId}</p>
                <p className="text-sm text-muted">
                  {generated.customer}, {generated.lineCount} {generated.lineCount === 1 ? 'línea' : 'líneas'}
                </p>
                <button
                  type="button"
                  onClick={() => downloadText(generated.filename, generated.xml)}
                  className="mt-2 text-sm font-medium text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal cursor-pointer"
                >
                  Descargar de nuevo
                </button>
                <p className="text-xs text-muted">Es el mismo archivo, no usa un número nuevo.</p>
              </div>
            )}
          </div>
        </section>

        <section className="min-w-0 p-4 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Líneas del Excel</h2>
            {parsed && !parsed.fatal && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted">
                  {lines.length} {lines.length === 1 ? 'línea' : 'líneas'} · {totalQty} piezas
                </span>
                {errorCount > 0 && (
                  <span className="inline-flex items-center gap-1 bg-danger-dim px-2 py-0.5 font-medium text-danger">
                    {errorCount} {errorCount === 1 ? 'error' : 'errores'}
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="inline-flex items-center gap-1 bg-warn-dim px-2 py-0.5 font-medium text-warn">
                    {warningCount} {warningCount === 1 ? 'aviso' : 'avisos'}
                  </span>
                )}
                {errorCount === 0 && warningCount === 0 && (
                  <span className="inline-flex items-center gap-1 bg-ok-dim px-2 py-0.5 font-medium text-ok">Sin problemas</span>
                )}
              </div>
            )}
          </div>

          {parsed?.fatal && (
            <p role="alert" className="border-l-4 border-danger bg-danger-dim p-3 text-sm text-danger">
              {parsed.fatal}
            </p>
          )}

          {!parsed && <p className="text-sm text-muted">Las líneas del Excel aparecerán aquí.</p>}

          {rows.length > 0 && (
            <div className="max-h-[70vh] overflow-auto border border-line">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-panel text-left text-xs text-muted shadow-[0_1px_0_var(--color-line)]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Fila</th>
                    <th className="px-3 py-2 font-medium">Item</th>
                    <th className="px-3 py-2 text-right font-medium">Qty</th>
                    <th className="px-3 py-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.row} className={`border-t border-line ${r.error ? 'bg-danger-dim' : r.warning ? 'bg-warn-dim' : ''}`}>
                      <td className="px-3 py-1.5 tabular-nums text-muted">{r.row}</td>
                      <td className="px-3 py-1.5 font-mono">{r.sku}</td>
                      <td className="px-3 py-1.5 text-right font-mono tabular-nums">{r.cantidad ?? ''}</td>
                      <td className={`px-3 py-1.5 ${r.error ? 'text-danger' : r.warning ? 'text-warn' : 'text-muted'}`}>{r.error ?? r.warning ?? 'ok'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
