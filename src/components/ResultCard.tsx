import type { Generated } from '../hooks/useShipmentGenerator';

interface Props {
  generated: Generated;
  onRedownload: () => void;
}

export function ResultCard({ generated, onRedownload }: Props) {
  return (
    <div className="border-l-4 border-ok bg-ok-dim p-3">
      <p className="text-sm font-medium text-ok">XML descargado</p>
      <p className="mt-1 break-all font-mono text-lg font-semibold tabular-nums">{generated.shipmentId}</p>
      <p className="text-sm text-muted">
        {generated.customer}, {generated.lineCount} {generated.lineCount === 1 ? 'línea' : 'líneas'}
      </p>
      <button
        type="button"
        onClick={onRedownload}
        className="mt-2 text-sm font-medium text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal cursor-pointer"
      >
        Descargar de nuevo
      </button>
      <p className="text-xs text-muted">Es el mismo archivo, no usa un número nuevo.</p>
    </div>
  );
}
