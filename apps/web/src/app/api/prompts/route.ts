import { runHandler } from '@/server/http';
import { listPrompts } from '@/server/proposal/prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** 관리 대상 프롬프트 전체를 현재 내용(DB 우선/기본값 폴백)과 함께 반환 */
export async function GET() {
  return runHandler(() => listPrompts());
}
