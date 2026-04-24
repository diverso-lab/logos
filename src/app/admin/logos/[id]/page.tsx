import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { updateLogo, deleteLogo, deleteVariant } from './actions';
import { AddVariantsForm } from './AddVariantsForm';

export const dynamic = 'force-dynamic';

export default async function EditLogoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const logo = await prisma.logo.findUnique({
    where: { id },
    include: { variants: { orderBy: { createdAt: 'asc' } } },
  });
  if (!logo) notFound();

  const doUpdate = updateLogo.bind(null, id);
  const doDelete = deleteLogo.bind(null, id);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{logo.name}</h1>
        <p className="text-sm text-zinc-500 font-mono">{logo.slug}</p>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold mb-4">Metadatos</h2>
        <form action={doUpdate} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Nombre</label>
              <input
                name="name"
                defaultValue={logo.name}
                required
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Slug</label>
              <input
                name="slug"
                defaultValue={logo.slug}
                required
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Tags</label>
            <input
              name="tags"
              defaultValue={logo.tags}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Descripción</label>
            <textarea
              name="description"
              defaultValue={logo.description ?? ''}
              rows={2}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 text-white text-sm font-medium px-3 py-1.5 hover:bg-zinc-800"
          >
            Guardar
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold mb-4">Variantes ({logo.variants.length})</h2>
        {logo.variants.length === 0 ? (
          <p className="text-sm text-zinc-500">Aún no hay variantes.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {logo.variants.map((v) => {
              const del = deleteVariant.bind(null, id, v.id);
              return (
                <li key={v.id} className="py-2 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md border border-zinc-200 grid place-items-center bg-zinc-50 overflow-hidden shrink-0">
                    <img src={`/api/files/${v.path}`} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{v.filename}</div>
                    <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                      <span>fondo: {v.background}</span>
                      <span>·</span>
                      <span className="uppercase font-mono">{v.format}</span>
                    </div>
                  </div>
                  <a
                    href={`/api/files/${v.path}?download=1`}
                    className="text-xs text-zinc-600 hover:text-zinc-900"
                    download
                  >
                    Descargar
                  </a>
                  <form action={del}>
                    <button className="text-xs text-red-600 hover:text-red-700">Eliminar</button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 pt-6 border-t border-zinc-100">
          <h3 className="text-sm font-semibold mb-2">Añadir más variantes</h3>
          <AddVariantsForm logoId={id} />
        </div>
      </section>

      <section className="rounded-xl border border-red-200 bg-red-50/30 p-6">
        <h2 className="text-sm font-semibold mb-2 text-red-700">Zona peligrosa</h2>
        <p className="text-xs text-red-700/80 mb-3">
          Eliminar el logo elimina también todos los ficheros del almacenamiento.
        </p>
        <form action={doDelete}>
          <button className="rounded-md border border-red-300 text-red-700 text-sm font-medium px-3 py-1.5 hover:bg-red-100">
            Eliminar logo
          </button>
        </form>
      </section>
    </div>
  );
}
