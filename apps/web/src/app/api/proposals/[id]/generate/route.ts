import type { NextRequest } from 'next/server';
import { runHandler } from '@/server/http';
import { generateProposal } from '@/server/proposal/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// AI 구조화가 길어질 수 있어 최대 실행 시간을 늘린다(Vercel).
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  return runHandler(async () => {
    const { id } = await ctx.params;
    return generateProposal(id);
  });
}
