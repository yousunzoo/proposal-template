import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { HttpError } from './http';

/** 라우트 핸들러용 관리자 세션 검증. 미인증이면 401 HttpError. */
export async function requireAdmin(): Promise<void> {
  const jar = await cookies();
  const ok = await verifySession(process.env.AUTH_SECRET ?? '', jar.get(SESSION_COOKIE)?.value);
  if (!ok) throw new HttpError(401, '인증이 필요합니다.');
}
