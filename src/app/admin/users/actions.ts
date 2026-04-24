'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

export async function createUser(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const role = String(formData.get('role') ?? 'user') === 'admin' ? 'admin' : 'user';

  if (!email || !password) throw new Error('Email y contraseña obligatorios');
  if (password.length < 6) throw new Error('Contraseña demasiado corta (min 6)');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Ese email ya existe');

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, password: hash, name: name || null, role },
  });

  revalidatePath('/admin/users');
}

export async function deleteUser(userId: string) {
  const me = await requireAdmin();
  if (userId === me.sub) throw new Error('No puedes eliminar tu propio usuario');
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath('/admin/users');
}

export async function toggleAdmin(userId: string) {
  const me = await requireAdmin();
  if (userId === me.sub) throw new Error('No puedes cambiar tu propio rol');
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) return;
  await prisma.user.update({
    where: { id: userId },
    data: { role: u.role === 'admin' ? 'user' : 'admin' },
  });
  revalidatePath('/admin/users');
}

export async function resetPassword(userId: string, formData: FormData) {
  await requireAdmin();
  const password = String(formData.get('password') ?? '');
  if (password.length < 6) throw new Error('Contraseña demasiado corta (min 6)');
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hash } });
  revalidatePath('/admin/users');
}
