import { NextRequest } from 'next/server';
import { readVariantFile, contentType, formatFromFilename } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const rel = path.join('/');
  try {
    const buf = await readVariantFile(rel);
    const fmt = formatFromFilename(rel);
    const url = new URL(req.url);
    const download = url.searchParams.get('download') === '1';
    const headers: Record<string, string> = {
      'Content-Type': contentType(fmt),
      'Cache-Control': 'public, max-age=3600',
    };
    if (download) {
      const fname = rel.split('/').pop() ?? 'file';
      headers['Content-Disposition'] = `attachment; filename="${fname}"`;
    }
    return new Response(new Uint8Array(buf), { headers });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
