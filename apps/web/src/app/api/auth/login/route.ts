import { NextResponse } from 'next/server';
import { createSession, safeEqual, SESSION_COOKIE, SESSION_TTL } from '@/lib/auth';

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD ?? '';
  const secret = process.env.AUTH_SECRET ?? '';
  if (!expected || !secret) {
    return NextResponse.json(
      { message: '서버 인증이 구성되지 않았습니다. (ADMIN_PASSWORD / AUTH_SECRET)' },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === 'string' ? body.password : '';

  if (!password || !safeEqual(password, expected)) {
    return NextResponse.json({ message: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  const token = await createSession(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL,
  });
  return res;
}
