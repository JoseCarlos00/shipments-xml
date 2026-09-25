import { useState } from 'react';
import { FileIcon, UploadIcon } from './icons';

interface Props {
  fileName: string;
  onFile: (file: File | undefined) => void;
}

export function ExcelDropzone({ fileName, onFile }: Props) {
  const [dragging, setDragging] = useState(false);

  return (
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
          onFile(e.dataTransfer.files[0]);
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
            onFile(e.target.files?.[0]);
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
  );
}
