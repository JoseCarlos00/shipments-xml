import type { ParsedRow } from '../lib/parseExcel';

export function LinesTable({ rows }: { rows: ParsedRow[] }) {
  return (
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
  );
}
