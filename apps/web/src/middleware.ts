import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

/**
 * 관리 페이지 접근 게이트.
 * 공개 라우트(/p/*, /login, /api/*, 정적 파일)는 matcher에서 제외된다.
 * 실제 데이터 방어선은 API 가드 + /api/admin 프록시가 담당한다(2중 방어).
 */
export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verifySession(process.env.AUTH_SECRET ?? '', token);
  if (ok) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/', '/proposals/:path*'],
};
