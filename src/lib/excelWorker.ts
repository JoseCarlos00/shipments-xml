import { parseWorkbook, type ParseResult } from './excelParseCore';

// Evitamos los tipos de lib "webworker" (chocan con los de "dom" ya usados
// en el proyecto). Le decimos a TS la forma mínima que necesitamos de `self`.
const ctx = self as unknown as {
  onmessage: ((ev: { data: ArrayBuffer }) => void) | null;
  postMessage: (data: ParseResult) => void;
};

ctx.onmessage = (e) => {
  ctx.postMessage(parseWorkbook(e.data));
};
