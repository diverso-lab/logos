'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { saveVariantFile, deleteVariantFile } from '@/lib/storage';
import { slugify } from '@/lib/slug';
import { reindexLogo } from '@/lib/logos';
import { detectBackgroundFromName, detectFormatFromName, BACKGROUND_OPTIONS, type Background } from '@/lib/classify';

type ParsedVariant = {
  file: File;
  background: Background;
  format: string;
};

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 2;
  while (await prisma.logo.findUnique({ where: { slug } })) {
    slug = `${base}-${i}`;
    i++;
  }
  return slug;
}

export async function createLogo(formData: FormData) {
  const session = await requireUser();

  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('El nombre es obligatorio');

  const description = String(formData.get('description') ?? '').trim();
  const tags = String(formData.get('tags') ?? '').trim();
  const customSlug = String(formData.get('slug') ?? '').trim();

  const baseSlug = slugify(customSlug || name);
  if (!baseSlug) throw new Error('No se pudo generar un slug válido');
  const slug = await uniqueSlug(baseSlug);

  const files = formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) throw new Error('Sube al menos un archivo');

  const bgOverrides = formData.getAll('background');
  const variants: ParsedVariant[] = files.map((f, idx) => {
    const rawBg = String(bgOverrides[idx] ?? '');
    const bg = (BACKGROUND_OPTIONS as string[]).includes(rawBg)
      ? (rawBg as Background)
      : detectBackgroundFromName(f.name);
    return {
      file: f,
      background: bg,
      format: detectFormatFromName(f.name),
    };
  });

  const logo = await prisma.logo.create({
    data: {
      slug,
      name,
      description: description || null,
      tags,
      uploadedById: session.sub,
    },
  });

  const created: string[] = [];
  try {
    for (const v of variants) {
      const buf = Buffer.from(await v.file.arrayBuffer());
      const saved = await saveVariantFile(slug, v.background, v.file.name, buf);
      await prisma.variant.create({
        data: {
          logoId: logo.id,
          background: v.background,
          format: v.format,
          filename: v.file.name,
          path: saved.path,
          size: saved.size,
        },
      });
      created.push(saved.path);
    }
  } catch (err) {
    for (const p of created) await deleteVariantFile(p).catch(() => {});
    await prisma.logo.delete({ where: { id: logo.id } }).catch(() => {});
    throw err;
  }

  await reindexLogo(logo.id);

  revalidatePath('/');
  revalidatePath('/admin');
  redirect(`/admin/logos/${logo.id}`);
}
