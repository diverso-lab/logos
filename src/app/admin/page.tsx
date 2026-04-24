import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Pencil } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const logos = await prisma.logo.findMany({
    include: { variants: true, uploadedBy: { select: { email: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Logos</h1>
          <p className="text-sm text-zinc-500">{logos.length} logo(s) en la biblioteca.</p>
        </div>
        <Link
          href="/admin/upload"
          className="rounded-md bg-zinc-900 text-white text-sm font-medium px-3 py-1.5 hover:bg-zinc-800 transition"
        >
          + Subir logo
        </Link>
      </div>

      {logos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <p className="text-sm text-zinc-500">Aún no has subido ningún logo.</p>
          <Link
            href="/admin/upload"
            className="inline-block mt-4 rounded-md bg-zinc-900 text-white text-sm font-medium px-3 py-1.5 hover:bg-zinc-800"
          >
            Subir el primero
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Slug</th>
                <th className="px-4 py-2 font-medium">Variantes</th>
                <th className="px-4 py-2 font-medium">Subido por</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {logos.map((l) => (
                <tr key={l.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2 font-medium">{l.name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-zinc-500">{l.slug}</td>
                  <td className="px-4 py-2 text-xs text-zinc-500">{l.variants.length}</td>
                  <td className="px-4 py-2 text-xs text-zinc-500">
                    {l.uploadedBy?.email ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/admin/logos/${l.id}`}
                      className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900"
                    >
                      <Pencil className="h-3 w-3" />
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
