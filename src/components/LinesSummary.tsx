interface Props {
  lineCount: number;
  totalQty: number;
  errorCount: number;
  warningCount: number;
}

export function LinesSummary({ lineCount, totalQty, errorCount, warningCount }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted">
        {lineCount} {lineCount === 1 ? 'línea' : 'líneas'} · {totalQty} piezas
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
  );
}
