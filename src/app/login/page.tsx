import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { login } from './actions';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect('/');
  const { next, error } = await searchParams;

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">logos</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Entrar</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Acceso restringido al personal del laboratorio.
          </p>
        </div>

        <form action={login} className="space-y-3">
          <input type="hidden" name="next" value={next ?? '/'} />
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              autoFocus
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600">Credenciales incorrectas.</p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 text-white text-sm font-medium py-2 hover:bg-zinc-800 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
