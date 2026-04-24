import { NextRequest } from 'next/server';
import archiver from 'archiver';
import { Readable } from 'stream';
import { prisma } from '@/lib/db';
import { absolutePath } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const logo = await prisma.logo.findUnique({
    where: { slug },
    include: { variants: true },
  });
  if (!logo) return new Response('Not found', { status: 404 });
  if (logo.variants.length === 0) return new Response('No variants', { status: 404 });

  const archive = archiver('zip', { zlib: { level: 9 } });

  for (const v of logo.variants) {
    try {
      archive.file(absolutePath(v.path), {
        name: `${logo.slug}/${v.background}/${v.filename}`,
      });
    } catch {
      // skip missing
    }
  }
  archive.finalize();

  const webStream = Readable.toWeb(archive as unknown as Readable) as ReadableStream<Uint8Array>;

  return new Response(webStream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${logo.slug}.zip"`,
      'Cache-Control': 'no-store',
    },
  });
}
