'use client';

import { useState, useTransition } from 'react';
import { UploadCloud } from 'lucide-react';
import { detectBackgroundFromName, detectFormatFromName, BACKGROUND_OPTIONS, type Background } from '@/lib/classify';
import { addVariants } from './actions';
import { cn } from '@/lib/cn';

type Item = { file: File; background: Background; format: string };

export function AddVariantsForm({ logoId }: { logoId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onFiles(files: FileList | File[]) {
    const next = Array.from(files).map((f) => ({
      file: f,
      background: detectBackgroundFromName(f.name),
      format: detectFormatFromName(f.name),
    }));
    setItems((prev) => [...prev, ...next]);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) return;
    const fd = new FormData();
    for (const it of items) {
      fd.append('files', it.file, it.file.name);
      fd.append('background', it.background);
    }
    startTransition(async () => {
      try {
        await addVariants(logoId, fd);
        setItems([]);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label
        className={cn(
          'block rounded-xl border-2 border-dashed border-zinc-200 bg-white px-4 py-6 text-center cursor-pointer hover:border-zinc-400 transition',
        )}
      >
        <UploadCloud className="h-5 w-5 mx-auto text-zinc-400" />
        <span className="block mt-1 text-xs text-zinc-500">Añadir archivos</span>
        <input
          type="file"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) onFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </label>

      {items.length > 0 && (
        <ul className="divide-y divide-zinc-100 rounded-md border border-zinc-100">
          {items.map((it, i) => (
            <li key={i} className="py-2 px-3 flex items-center gap-3 text-sm">
              <span className="flex-1 truncate">{it.file.name}</span>
              <span className="text-[11px] uppercase font-mono text-zinc-500">{it.format}</span>
              <select
                value={it.background}
                onChange={(e) =>
                  setItems((prev) => {
                    const copy = [...prev];
                    copy[i] = { ...copy[i], background: e.target.value as Background };
                    return copy;
                  })
                }
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs"
              >
                {BACKGROUND_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    fondo: {b}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-xs text-zinc-400 hover:text-red-600"
              >
                quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending || items.length === 0}
        className={cn(
          'rounded-md bg-zinc-900 text-white text-sm font-medium px-3 py-1.5',
          (isPending || items.length === 0) && 'opacity-50 cursor-not-allowed',
        )}
      >
        {isPending ? 'Subiendo…' : `Añadir ${items.length || ''} variante(s)`}
      </button>
    </form>
  );
}
