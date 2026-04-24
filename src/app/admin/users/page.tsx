import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { createUser, deleteUser, toggleAdmin, resetPassword } from './actions';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const me = await getSession();
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-sm text-zinc-500">
          Sólo el admin puede dar acceso a nuevas personas.
        </p>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold mb-4">Dar acceso a alguien nuevo</h2>
        <form action={createUser} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="email@lab"
            className="md:col-span-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
          />
          <input
            name="name"
            placeholder="Nombre (opcional)"
            className="md:col-span-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
          />
          <input
            name="password"
            type="text"
            required
            placeholder="contraseña inicial"
            className="md:col-span-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-mono"
          />
          <div className="flex items-center gap-2">
            <select name="role" className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm">
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <button className="rounded-md bg-zinc-900 text-white text-sm font-medium px-3 py-2 hover:bg-zinc-800">
              Crear
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">Rol</th>
              <th className="px-4 py-2 font-medium">Creado</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === me?.sub;
              const doDelete = deleteUser.bind(null, u.id);
              const doToggle = toggleAdmin.bind(null, u.id);
              const doReset = resetPassword.bind(null, u.id);
              return (
                <tr key={u.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 text-zinc-500">{u.name ?? '—'}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        u.role === 'admin'
                          ? 'inline-block text-[10px] uppercase font-medium text-zinc-900 bg-zinc-200 rounded px-1.5 py-0.5'
                          : 'inline-block text-[10px] uppercase font-medium text-zinc-500 bg-zinc-100 rounded px-1.5 py-0.5'
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-zinc-500">
                    {u.createdAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <form action={doReset} className="flex items-center gap-1">
                        <input
                          type="text"
                          name="password"
                          placeholder="nueva contraseña"
                          className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs w-40"
                        />
                        <button className="text-xs text-zinc-600 hover:text-zinc-900">
                          resetear
                        </button>
                      </form>
                      {!isSelf && (
                        <>
                          <form action={doToggle}>
                            <button className="text-xs text-zinc-600 hover:text-zinc-900">
                              {u.role === 'admin' ? 'hacer user' : 'hacer admin'}
                            </button>
                          </form>
                          <form action={doDelete}>
                            <button className="text-xs text-red-600 hover:text-red-700">eliminar</button>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
