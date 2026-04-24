export type Background = 'light' | 'dark' | 'color' | 'transparent';

const BG_PATTERNS: { bg: Background; re: RegExp }[] = [
  { bg: 'dark', re: /\b(dark|black|negro|oscuro|invert|inverso|on[-_\s]?black|on[-_\s]?dark|reverse|reversed|night)\b/i },
  { bg: 'light', re: /\b(light|white|claro|blanco|on[-_\s]?white|on[-_\s]?light|positivo|regular|default|normal|day)\b/i },
  { bg: 'color', re: /\b(color|colour|colores|multicolor|rgb|full[-_\s]?color|primary)\b/i },
  { bg: 'transparent', re: /\b(transparent|transparente|alpha|notrans|trans)\b/i },
];

export function detectBackgroundFromName(filename: string): Background {
  const base = filename.toLowerCase();
  for (const p of BG_PATTERNS) {
    if (p.re.test(base)) return p.bg;
  }
  return 'light';
}

const KNOWN_FORMATS = new Set(['svg', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf', 'eps', 'ai']);

export function detectFormatFromName(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot === -1) return 'bin';
  const ext = filename.slice(dot + 1).toLowerCase();
  return KNOWN_FORMATS.has(ext) ? (ext === 'jpeg' ? 'jpg' : ext) : ext;
}

export const BACKGROUND_OPTIONS: Background[] = ['light', 'dark', 'color', 'transparent'];
