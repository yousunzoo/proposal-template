import type { NextRequest } from 'next/server';
import { runHandler } from '@/server/http';
import { getProposal, updateProposal, removeProposal } from '@/server/proposal/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  return runHandler(async () => {
    const { id } = await ctx.params;
    return getProposal(id);
  });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  return runHandler(async () => {
    const { id } = await ctx.params;
    const body = await req.json();
    return updateProposal(id, body);
  });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  return runHandler(async () => {
    const { id } = await ctx.params;
    return removeProposal(id);
  });
}
