import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE = 'logos_session';

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) return null;
  return new TextEncoder().encode(s);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  const sec = secret();
  let role: string | null = null;

  if (token && sec) {
    try {
      const { payload } = await jwtVerify(token, sec);
      role = (payload.role as string) ?? 'user';
    } catch {
      role = null;
    }
  }

  if (!role) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/admin/users') && role !== 'admin') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
