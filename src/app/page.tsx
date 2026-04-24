import { Nav } from '@/components/Nav';
import { Browse } from '@/components/Browse';
import { searchLogosFull, toDoc } from '@/lib/logos';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const logos = await searchLogosFull('');
  const initial = logos.map((l) => ({
    ...toDoc(l),
    variants: l.variants.map((v) => ({
      id: v.id,
      background: v.background,
      format: v.format,
      filename: v.filename,
      path: v.path,
      size: v.size,
    })),
  }));

  return (
    <>
      <Nav />
      <Browse initial={initial} />
    </>
  );
}
