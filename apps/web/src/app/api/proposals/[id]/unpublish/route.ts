import type { NextRequest } from 'next/server';
import { runHandler } from '@/server/http';
import { requireAdmin } from '@/server/require-admin';
import { unpublishProposal } from '@/server/proposal/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  return runHandler(async () => {
    await requireAdmin();
    const { id } = await ctx.params;
    return unpublishProposal(id);
  });
}
