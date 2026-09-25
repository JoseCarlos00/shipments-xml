import { CustomerPicker } from './components/CustomerPicker';
import { ExcelDropzone } from './components/ExcelDropzone';
import { LinesSummary } from './components/LinesSummary';
import { LinesTable } from './components/LinesTable';
import { ResultCard } from './components/ResultCard';
import { useShipmentGenerator } from './hooks/useShipmentGenerator';

export default function App() {
  const g = useShipmentGenerator();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-4 px-4 py-3 sm:px-6">
          <h1 className="text-lg font-semibold">Shipments XML</h1>
          <p className="text-sm text-muted">{g.customers.length} customers cargados</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl bg-panel lg:grid lg:min-h-128 lg:grid-cols-[24rem_1fr] lg:border-x lg:border-line">
        <section className="space-y-6 border-b border-line p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <ExcelDropzone fileName={g.fileName} onFile={g.loadFile} />

          <CustomerPicker customers={g.customers} value={g.customerInput} onChange={g.setCustomerInput} customer={g.customer} issues={g.issues} />

          <div>
            <button
              type="button"
              onClick={() => void g.generate()}
              disabled={!g.canGenerate}
              className="w-full bg-signal px-4 py-3 text-sm font-semibold text-floor hover:bg-signal-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed disabled:bg-line disabled:text-muted cursor-pointer"
            >
              {g.busy ? 'Generando…' : 'Generar y descargar XML'}
            </button>
            {g.blocker && <p className="mt-2 text-sm text-muted">{g.blocker}</p>}
            {g.error && (
              <p role="alert" className="mt-2 text-sm text-danger">
                {g.error}
              </p>
            )}
          </div>

          <div aria-live="polite">{g.generated && <ResultCard generated={g.generated} onRedownload={g.redownload} />}</div>
        </section>

        <section className="min-w-0 p-4 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Líneas del Excel</h2>
            {g.hasParsed && !g.parsedFatal && (
              <LinesSummary lineCount={g.lineCount} totalQty={g.totalQty} errorCount={g.errorCount} warningCount={g.warningCount} />
            )}
          </div>

          {g.parsedFatal && (
            <p role="alert" className="border-l-4 border-danger bg-danger-dim p-3 text-sm text-danger">
              {g.parsedFatal}
            </p>
          )}

          {!g.hasParsed && <p className="text-sm text-muted">Las líneas del Excel aparecerán aquí.</p>}

          {g.rows.length > 0 && <LinesTable rows={g.rows} />}
        </section>
      </main>
    </div>
  );
}
