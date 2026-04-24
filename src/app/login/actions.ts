'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createSession, destroySession } from '@/lib/session';

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/') || '/';

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }
  await createSession({
    sub: user.id,
    email: user.email,
    role: user.role === 'admin' ? 'admin' : 'user',
    name: user.name,
  });
  redirect(next.startsWith('/') ? next : '/');
}

export async function logout() {
  await destroySession();
  redirect('/login');
}
