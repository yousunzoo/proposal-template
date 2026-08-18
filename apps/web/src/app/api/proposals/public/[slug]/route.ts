import type { NextRequest } from 'next/server';
import { runHandler } from '@/server/http';
import { getProposalBySlug } from '@/server/proposal/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ slug: string }> };

// 공개 엔드포인트 — 인증 불필요(발행된 제안서만 반환).
export async function GET(_req: NextRequest, ctx: Ctx) {
  return runHandler(async () => {
    const { slug } = await ctx.params;
    return getProposalBySlug(slug);
  });
}
