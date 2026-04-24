'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { saveVariantFile, deleteVariantFile } from '@/lib/storage';
import { slugify } from '@/lib/slug';
import { reindexLogo, deindexLogo } from '@/lib/logos';
import { detectBackgroundFromName, detectFormatFromName, BACKGROUND_OPTIONS, type Background } from '@/lib/classify';

export async function updateLogo(id: string, formData: FormData) {
  await requireUser();
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const tags = String(formData.get('tags') ?? '').trim();
  const newSlugRaw = String(formData.get('slug') ?? '').trim();
  const newSlug = slugify(newSlugRaw);

  if (!name) throw new Error('Nombre obligatorio');
  if (!newSlug) throw new Error('Slug inválido');

  await prisma.logo.update({
    where: { id },
    data: {
      name,
      slug: newSlug,
      description: description || null,
      tags,
    },
  });
  await reindexLogo(id);
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath(`/admin/logos/${id}`);
}

export async function deleteLogo(id: string) {
  await requireUser();
  const logo = await prisma.logo.findUnique({ where: { id }, include: { variants: true } });
  if (!logo) return;
  for (const v of logo.variants) {
    await deleteVariantFile(v.path).catch(() => {});
  }
  await prisma.logo.delete({ where: { id } });
  await deindexLogo(id);
  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin');
}

export async function deleteVariant(id: string, variantId: string) {
  await requireUser();
  const v = await prisma.variant.findUnique({ where: { id: variantId } });
  if (!v || v.logoId !== id) return;
  await deleteVariantFile(v.path).catch(() => {});
  await prisma.variant.delete({ where: { id: variantId } });
  await reindexLogo(id);
  revalidatePath(`/admin/logos/${id}`);
  revalidatePath('/');
}

export async function addVariants(id: string, formData: FormData) {
  await requireUser();
  const logo = await prisma.logo.findUnique({ where: { id } });
  if (!logo) throw new Error('Logo no encontrado');

  const files = formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  const bgOverrides = formData.getAll('background');
  if (files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const rawBg = String(bgOverrides[i] ?? '');
    const bg: Background = (BACKGROUND_OPTIONS as string[]).includes(rawBg)
      ? (rawBg as Background)
      : detectBackgroundFromName(f.name);
    const buf = Buffer.from(await f.arrayBuffer());
    const saved = await saveVariantFile(logo.slug, bg, f.name, buf);
    await prisma.variant.create({
      data: {
        logoId: logo.id,
        background: bg,
        format: detectFormatFromName(f.name),
        filename: f.name,
        path: saved.path,
        size: saved.size,
      },
    });
  }

  await reindexLogo(id);
  revalidatePath(`/admin/logos/${id}`);
  revalidatePath('/');
}
