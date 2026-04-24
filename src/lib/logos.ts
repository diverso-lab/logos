import { prisma } from './db';
import { indexLogo, removeLogo, searchLogos as esSearch, type LogoDoc } from './elastic';
import type { Logo, Variant } from '@prisma/client';

export type LogoWithVariants = Logo & { variants: Variant[] };

export function toDoc(logo: LogoWithVariants): LogoDoc {
  return {
    id: logo.id,
    slug: logo.slug,
    name: logo.name,
    description: logo.description ?? '',
    tags: logo.tags ? logo.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    formats: Array.from(new Set(logo.variants.map((v) => v.format))),
    backgrounds: Array.from(new Set(logo.variants.map((v) => v.background))),
    variantCount: logo.variants.length,
    updatedAt: logo.updatedAt.toISOString(),
  };
}

export async function reindexLogo(id: string) {
  const logo = await prisma.logo.findUnique({ where: { id }, include: { variants: true } });
  if (logo) await indexLogo(toDoc(logo));
}

export async function deindexLogo(id: string) {
  await removeLogo(id);
}

export async function searchLogosFull(query: string): Promise<LogoWithVariants[]> {
  const q = query.trim();
  if (q === '') return listAllLogos();
  try {
    const docs = await esSearch(q, 60);
    const ids = docs.map((d) => d.id);
    if (ids.length === 0) return [];
    const logos = await prisma.logo.findMany({
      where: { id: { in: ids } },
      include: { variants: true },
    });
    const byId = new Map(logos.map((l) => [l.id, l]));
    return ids.map((id) => byId.get(id)).filter(Boolean) as LogoWithVariants[];
  } catch {
    return prisma.logo.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { variants: true },
      orderBy: { updatedAt: 'desc' },
      take: 60,
    });
  }
}

export async function listAllLogos(): Promise<LogoWithVariants[]> {
  return prisma.logo.findMany({
    include: { variants: true },
    orderBy: { updatedAt: 'desc' },
  });
}
