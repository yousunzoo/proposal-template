import { NextResponse } from 'next/server';

/** 상태 코드를 갖는 애플리케이션 에러 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** 라우트 핸들러 실행 래퍼 — HttpError는 해당 상태로, 그 외는 500으로 매핑 */
export async function runHandler<T>(fn: () => Promise<T>): Promise<NextResponse> {
  try {
    const data = await fn();
    if (data === undefined || data === null) return NextResponse.json({ ok: true });
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ message: e.message }, { status: e.status });
    }
    console.error('[api] unhandled error:', e);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
