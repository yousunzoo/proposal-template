import type { NextRequest } from 'next/server';
import { HttpError } from '@/server/http';
import { renderProposalPdf, safePdfFilename } from '@/server/proposal/pdf';
import { getProposal } from '@/server/proposal/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

/**
 * PDF 생성 — 발행 여부와 무관하게 id로 생성한다.
 * print 페이지(/proposals/[id]/print)를 헤드리스 브라우저로 열어 렌더링한다.
 */
export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const proposal = await getProposal(id);

    const printUrl = new URL(`/proposals/${id}/print`, req.nextUrl.origin);
    const pdf = await renderProposalPdf(printUrl.toString());

    const body = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
    const filename = safePdfFilename(proposal.title);

    return new Response(body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(pdf.byteLength),
        'Cache-Control': 'no-store',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (e) {
    if (e instanceof HttpError) {
      return Response.json({ message: e.message }, { status: e.status });
    }
    console.error('[pdf] failed to generate proposal pdf (by id):', e);
    return Response.json({ message: 'PDF 생성에 실패했습니다.' }, { status: 500 });
  }
}
