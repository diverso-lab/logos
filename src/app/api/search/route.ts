import { NextRequest } from 'next/server';
import { searchLogosFull, toDoc } from '@/lib/logos';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q') ?? '';
  const results = await searchLogosFull(q);
  return Response.json({
    results: results.map((l) => ({
      ...toDoc(l),
      variants: l.variants.map((v) => ({
        id: v.id,
        background: v.background,
        format: v.format,
        filename: v.filename,
        path: v.path,
        size: v.size,
      })),
    })),
  });
}
