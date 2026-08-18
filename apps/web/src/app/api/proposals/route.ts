import type { NextRequest } from 'next/server';
import { runHandler } from '@/server/http';
import { requireAdmin } from '@/server/require-admin';
import { listProposals, createProposal } from '@/server/proposal/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return runHandler(async () => {
    await requireAdmin();
    return listProposals();
  });
}

export async function POST(req: NextRequest) {
  return runHandler(async () => {
    await requireAdmin();
    const body = await req.json();
    return createProposal(body);
  });
}
