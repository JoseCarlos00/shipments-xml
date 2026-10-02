export type { ParsedRow, ParseResult } from './excelParseCore';
export { toLines } from './excelParseCore';
import type { ParseResult } from './excelParseCore';

let worker: Worker | undefined;
const queue: Array<{ resolve: (r: ParseResult) => void; reject: (e: unknown) => void }> = [];

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./excelWorker.ts', import.meta.url), { type: 'module' });
    // El worker procesa un mensaje a la vez, en el orden que se mandaron:
    // la cola siempre resuelve la promesa correcta, aunque se encimen llamadas.
    worker.addEventListener('message', (e: MessageEvent<ParseResult>) => {
      queue.shift()?.resolve(e.data);
    });
    worker.addEventListener('error', (e) => {
      queue.shift()?.reject(e.error ?? new Error(e.message));
    });
  }
  return worker;
}

/** Lee la primera hoja en un Web Worker, para no congelar la UI con archivos grandes. */
export async function parseExcel(file: Blob): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const w = getWorker();
  return new Promise((resolve, reject) => {
    queue.push({ resolve, reject });
    w.postMessage(buffer, [buffer]); // transferido, sin copiar
  });
}
