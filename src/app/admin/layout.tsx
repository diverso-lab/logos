import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { getSession } from '@/lib/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect('/login?next=/admin');

  return (
    <>
      <Nav />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <nav className="flex items-center gap-1 mb-6 text-sm">
          <Link href="/admin" className="rounded-md px-3 py-1.5 hover:bg-zinc-100 transition">
            Logos
          </Link>
          <Link
            href="/admin/upload"
            className="rounded-md px-3 py-1.5 hover:bg-zinc-100 transition"
          >
            Subir
          </Link>
          {s.role === 'admin' && (
            <Link
              href="/admin/users"
              className="rounded-md px-3 py-1.5 hover:bg-zinc-100 transition"
            >
              Usuarios
            </Link>
          )}
        </nav>
        {children}
      </div>
    </>
  );
}
