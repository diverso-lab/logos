'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Download, Search, Package, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = {
  id: string;
  background: string;
  format: string;
  filename: string;
  path: string;
  size: number;
};

type LogoResult = {
  id: string;
  slug: string;
  name: string;
  description: string;
  tags: string[];
  formats: string[];
  backgrounds: string[];
  variantCount: number;
  updatedAt: string;
  variants: Variant[];
};

export function Browse({ initial }: { initial: LogoResult[] }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<LogoResult[]>(initial);
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const debRef = useRef<NodeJS.Timeout | null>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results);
        }
      });
    }, 150);
    return () => {
      if (debRef.current) clearTimeout(debRef.current);
    };
  }, [q]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">El logo que necesitas, ya.</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Busca, previsualiza, descarga. Sin vueltas.
        </p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            autoFocus
            placeholder="Buscar logos… (nombre, tags, proyecto)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-3 text-sm outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
        <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1">
          <button
            onClick={() => setMode('light')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
              mode === 'light' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900',
            )}
            aria-label="Fondo claro"
          >
            <Sun className="h-3.5 w-3.5" />
            Claro
          </button>
          <button
            onClick={() => setMode('dark')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
              mode === 'dark' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900',
            )}
            aria-label="Fondo oscuro"
          >
            <Moon className="h-3.5 w-3.5" />
            Oscuro
          </button>
        </div>
      </div>

      {isPending && (
        <div className="text-xs text-zinc-400 mb-4">Buscando…</div>
      )}

      {results.length === 0 ? (
        <EmptyState query={q} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((l) => (
            <LogoCard key={l.id} logo={l} mode={mode} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-200 bg-white py-20 text-center">
      <p className="text-sm text-zinc-500">
        {query.trim() ? (
          <>No hay resultados para «<span className="font-medium text-zinc-700">{query}</span>».</>
        ) : (
          <>Aún no hay logos. Pídele al admin que suba alguno.</>
        )}
      </p>
    </div>
  );
}

function pickPreview(l: LogoResult, mode: 'light' | 'dark'): Variant | null {
  const target = mode === 'dark' ? 'dark' : 'light';
  const byBg = l.variants.filter((v) => v.background === target);
  const pref = ['svg', 'png', 'webp', 'jpg', 'jpeg'];
  for (const fmt of pref) {
    const hit = byBg.find((v) => v.format === fmt);
    if (hit) return hit;
  }
  if (byBg[0]) return byBg[0];
  for (const fmt of pref) {
    const hit = l.variants.find((v) => v.format === fmt);
    if (hit) return hit;
  }
  return l.variants[0] ?? null;
}

function LogoCard({ logo, mode }: { logo: LogoResult; mode: 'light' | 'dark' }) {
  const [open, setOpen] = useState(false);
  const preview = pickPreview(logo, mode);
  const svgVariant = logo.variants.find(
    (v) => v.format === 'svg' && v.background === (mode === 'dark' ? 'dark' : 'light'),
  ) ?? logo.variants.find((v) => v.format === 'svg');
  const pngVariant = logo.variants.find(
    (v) => v.format === 'png' && v.background === (mode === 'dark' ? 'dark' : 'light'),
  ) ?? logo.variants.find((v) => v.format === 'png');

  return (
    <div className="group rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div
        className={cn(
          'h-40 p-6 overflow-hidden transition-colors',
          mode === 'dark' ? 'bg-zinc-900' : 'bg-zinc-50',
        )}
      >
        {preview ? (
          <img
            src={`/api/files/${preview.path}`}
            alt={logo.name}
            className="block w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full grid place-items-center">
            <span className="text-xs text-zinc-400">sin preview</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{logo.name}</div>
            <div className="text-xs text-zinc-500 truncate font-mono">{logo.slug}</div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
            <Package className="h-3 w-3" />
            {logo.variantCount}
          </div>
        </div>

        {logo.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {logo.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-100 rounded px-1.5 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          {svgVariant && (
            <a
              href={`/api/files/${svgVariant.path}?download=1`}
              className="flex-1 text-center rounded-md bg-zinc-900 text-white text-xs font-medium py-1.5 hover:bg-zinc-800 transition"
              download
            >
              SVG
            </a>
          )}
          {pngVariant && (
            <a
              href={`/api/files/${pngVariant.path}?download=1`}
              className="flex-1 text-center rounded-md border border-zinc-200 text-xs font-medium py-1.5 hover:bg-zinc-50 transition"
              download
            >
              PNG
            </a>
          )}
          <a
            href={`/api/download/${logo.slug}`}
            className="flex-1 text-center rounded-md border border-zinc-200 text-xs font-medium py-1.5 hover:bg-zinc-50 transition inline-flex items-center justify-center gap-1"
            download
            title="Descargar todas las variantes"
          >
            <Download className="h-3 w-3" /> zip
          </a>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-2 w-full text-xs text-zinc-500 hover:text-zinc-900 transition"
        >
          {open ? 'Ocultar variantes' : `Ver las ${logo.variantCount} variantes`}
        </button>

        {open && (
          <div className="mt-3 space-y-1 border-t border-zinc-100 pt-3">
            {logo.variants.map((v) => (
              <a
                key={v.id}
                href={`/api/files/${v.path}?download=1`}
                download
                className="flex items-center justify-between text-xs rounded-md px-2 py-1.5 hover:bg-zinc-50 transition"
              >
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: backgroundColor(v.background) }} />
                  <span className="font-mono">{v.background}</span>
                  <span className="uppercase text-zinc-500">{v.format}</span>
                </span>
                <Download className="h-3 w-3 text-zinc-400" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function backgroundColor(name: string): string {
  switch (name) {
    case 'light':
      return '#f4f4f5';
    case 'dark':
      return '#18181b';
    case 'color':
      return '#6366f1';
    case 'transparent':
      return 'transparent';
    default:
      return '#a1a1aa';
  }
}
