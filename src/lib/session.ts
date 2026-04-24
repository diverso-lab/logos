import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export type SessionPayload = {
  sub: string;
  email: string;
  role: 'admin' | 'user';
  name?: string | null;
};

const COOKIE = 'logos_session';
const ALG = 'HS256';

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error('AUTH_SECRET must be set and at least 16 chars long');
  }
  return new TextEncoder().encode(s);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) throw new Error('Unauthorized');
  return s;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const s = await requireUser();
  if (s.role !== 'admin') throw new Error('Forbidden');
  return s;
}

export const SESSION_COOKIE = COOKIE;
