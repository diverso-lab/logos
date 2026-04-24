import { mkdir, writeFile, unlink, readFile, stat } from 'fs/promises';
import { join, normalize, sep } from 'path';
import { randomBytes } from 'crypto';

export const STORAGE_DIR = process.env.STORAGE_DIR || '/data/uploads';

export async function ensureStorage() {
  await mkdir(STORAGE_DIR, { recursive: true });
}

function randomId(len = 8) {
  return randomBytes(len).toString('hex');
}

export type SaveResult = {
  path: string;
  size: number;
  filename: string;
};

const MIME: Record<string, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  pdf: 'application/pdf',
  eps: 'application/postscript',
  ai: 'application/postscript',
};

export function formatFromFilename(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot === -1) return 'bin';
  return filename.slice(dot + 1).toLowerCase();
}

export function contentType(format: string): string {
  return MIME[format.toLowerCase()] || 'application/octet-stream';
}

export async function saveVariantFile(
  slug: string,
  background: string,
  originalName: string,
  data: Buffer,
): Promise<SaveResult> {
  await ensureStorage();
  const format = formatFromFilename(originalName);
  const dir = join(STORAGE_DIR, slug);
  await mkdir(dir, { recursive: true });
  const safeBg = background.replace(/[^a-z0-9_-]/gi, '');
  const filename = `${slug}-${safeBg}-${randomId(4)}.${format}`;
  const full = join(dir, filename);
  await writeFile(full, data);
  return { path: `${slug}/${filename}`, size: data.length, filename };
}

export async function readVariantFile(relativePath: string): Promise<Buffer> {
  const safe = normalize(relativePath).split(sep).join('/');
  if (safe.startsWith('..')) throw new Error('Invalid path');
  const full = join(STORAGE_DIR, safe);
  return readFile(full);
}

export async function deleteVariantFile(relativePath: string): Promise<void> {
  const safe = normalize(relativePath).split(sep).join('/');
  if (safe.startsWith('..')) throw new Error('Invalid path');
  const full = join(STORAGE_DIR, safe);
  try {
    await unlink(full);
  } catch {
    // ignore
  }
}

export async function variantStat(relativePath: string) {
  const safe = normalize(relativePath).split(sep).join('/');
  if (safe.startsWith('..')) throw new Error('Invalid path');
  const full = join(STORAGE_DIR, safe);
  return stat(full);
}

export function absolutePath(relativePath: string): string {
  const safe = normalize(relativePath).split(sep).join('/');
  if (safe.startsWith('..')) throw new Error('Invalid path');
  return join(STORAGE_DIR, safe);
}
