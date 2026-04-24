'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { UploadCloud, X, FileIcon } from 'lucide-react';
import { detectBackgroundFromName, detectFormatFromName, BACKGROUND_OPTIONS, type Background } from '@/lib/classify';
import { slugify } from '@/lib/slug';
import { createLogo } from './actions';
import { cn } from '@/lib/cn';

type Item = {
  id: string;
  file: File;
  background: Background;
  format: string;
  previewUrl?: string;
};

export function UploadForm() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const autoSlug = useMemo(() => slugify(name), [name]);
  const effectiveSlug = slugTouched && slug ? slug : autoSlug;

  function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files);
    const mapped: Item[] = incoming.map((f) => {
      const previewUrl = /^image\//.test(f.type) || /\.svg$/i.test(f.name) ? URL.createObjectURL(f) : undefined;
      return {
        id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(16).slice(2, 6)}`,
        file: f,
        background: detectBackgroundFromName(f.name),
        format: detectFormatFromName(f.name),
        previewUrl,
      };
    });
    setItems((prev) => [...prev, ...mapped]);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  }

  function updateBg(id: string, bg: Background) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, background: bg } : x)));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Pon un nombre al logo.');
    if (items.length === 0) return setError('Sube al menos un archivo.');

    const fd = new FormData();
    fd.set('name', name);
    fd.set('slug', effectiveSlug);
    fd.set('tags', tags);
    fd.set('description', description);
    for (const it of items) {
      fd.append('files', it.file, it.file.name);
      fd.append('background', it.background);
    }

    startTransition(async () => {
      try {
        await createLogo(fd);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al subir';
        if (msg.includes('NEXT_REDIRECT')) return;
        setError(msg);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="UVLHub"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">
            Slug <span className="text-zinc-400 font-normal">(auto)</span>
          </label>
          <input
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="uvlhub"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-mono outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1">Tags (separados por coma)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="uvl, diverso, lab"
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
        />
      </div>

      <DropZone
        onFiles={addFiles}
        onClick={() => inputRef.current?.click()}
        count={items.length}
      />
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {items.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100 text-xs uppercase tracking-wider text-zinc-500 flex items-center justify-between">
            <span>{items.length} archivo(s) clasificados automáticamente</span>
            <span className="text-[10px] normal-case text-zinc-400">Puedes ajustar el fondo si el detector falló</span>
          </div>
          <ul className="divide-y divide-zinc-100">
            {items.map((it) => (
              <li key={it.id} className="px-4 py-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-md border border-zinc-200 grid place-items-center bg-zinc-50 overflow-hidden shrink-0">
                  {it.previewUrl ? (
                    <img src={it.previewUrl} alt="" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <FileIcon className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{it.file.name}</div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                    <span className="uppercase font-mono">{it.format}</span>
                    <span>·</span>
                    <span>{formatSize(it.file.size)}</span>
                  </div>
                </div>
                <select
                  value={it.background}
                  onChange={(e) => updateBg(it.id, e.target.value as Background)}
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
                  onClick={() => removeItem(it.id)}
                  className="text-zinc-400 hover:text-zinc-900 transition"
                  aria-label="Quitar"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || items.length === 0 || !name.trim()}
          className={cn(
            'rounded-md bg-zinc-900 text-white text-sm font-medium px-4 py-2 transition',
            isPending ? 'opacity-60' : 'hover:bg-zinc-800',
            (items.length === 0 || !name.trim()) && 'opacity-50 cursor-not-allowed',
          )}
        >
          {isPending ? 'Subiendo…' : 'Crear logo'}
        </button>
        <span className="text-xs text-zinc-500">
          Se indexará automáticamente en Elasticsearch.
        </span>
      </div>
    </form>
  );
}

function DropZone({
  onFiles,
  onClick,
  count,
}: {
  onFiles: (f: FileList | File[]) => void;
  onClick: () => void;
  count: number;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (e.dataTransfer.files) onFiles(e.dataTransfer.files);
      }}
      onClick={onClick}
      className={cn(
        'rounded-xl border-2 border-dashed bg-white text-center py-12 cursor-pointer transition',
        over ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400',
      )}
    >
      <UploadCloud className="h-6 w-6 mx-auto text-zinc-400" />
      <p className="mt-2 text-sm font-medium">
        Suelta aquí todas las variantes del logo
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        SVG, PNG, JPG, PDF, EPS. Se detecta formato y fondo automáticamente.
      </p>
      {count > 0 && (
        <p className="mt-2 text-[11px] text-zinc-400">{count} añadido(s)</p>
      )}
    </div>
  );
}

function formatSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
