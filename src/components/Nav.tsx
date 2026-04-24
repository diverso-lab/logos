import Link from 'next/link';
import { getSession } from '@/lib/session';
import { logout } from '@/app/login/actions';

export async function Nav() {
  const session = await getSession();
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-zinc-900 grid place-items-center">
            <span className="text-white text-[10px] font-bold">L</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">logos</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {session ? (
            <>
              <Link
                href="/admin/upload"
                className="rounded-md px-3 py-1.5 hover:bg-zinc-100 transition"
              >
                Subir
              </Link>
              <Link
                href="/admin"
                className="rounded-md px-3 py-1.5 hover:bg-zinc-100 transition"
              >
                Gestionar
              </Link>
              <span className="hidden sm:inline text-xs text-zinc-500 px-2">
                {session.email}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-md px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 transition"
                >
                  Salir
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 transition"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
