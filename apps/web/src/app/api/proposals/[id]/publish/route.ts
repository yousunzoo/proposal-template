import type { NextRequest } from 'next/server';
import { runHandler } from '@/server/http';
import { publishProposal } from '@/server/proposal/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  return runHandler(async () => {
    const { id } = await ctx.params;
    return publishProposal(id, req.nextUrl.origin);
  });
}
