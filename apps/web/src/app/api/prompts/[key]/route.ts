import type { NextRequest } from 'next/server';
import { HttpError, runHandler } from '@/server/http';
import { listPrompts, savePrompt } from '@/server/proposal/prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ key: string }> };

/** 단일 프롬프트 조회 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  return runHandler(async () => {
    const { key } = await ctx.params;
    const found = (await listPrompts()).find((p) => p.key === key);
    if (!found) throw new HttpError(404, '해당 프롬프트를 찾을 수 없습니다.');
    return found;
  });
}

/** 프롬프트 저장(빈 내용이면 기본값으로 초기화) */
export async function PUT(req: NextRequest, ctx: Ctx) {
  return runHandler(async () => {
    const { key } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { content?: unknown };
    const content = typeof body.content === 'string' ? body.content : '';
    try {
      return await savePrompt(key, content);
    } catch (e) {
      throw new HttpError(400, e instanceof Error ? e.message : '저장에 실패했습니다.');
    }
  });
}
