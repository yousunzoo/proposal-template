import type { NextRequest } from 'next/server';
import { runHandler } from '@/server/http';
import { listProposals, createProposal } from '@/server/proposal/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return runHandler(async () => {
    return listProposals();
  });
}

export async function POST(req: NextRequest) {
  return runHandler(async () => {
    const body = await req.json();
    return createProposal(body);
  });
}
