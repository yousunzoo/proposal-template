import type { NextRequest } from 'next/server';
import { HttpError } from '@/server/http';
import { renderProposalPdf } from '@/server/proposal/pdf';
import { getProposalBySlug } from '@/server/proposal/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Ctx = { params: Promise<{ slug: string }> };

function safePdfFilename(title: string) {
  const base =
    title
      .replace(/[\\/:*?"<>|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80) || 'proposal';
  return `${base}.pdf`;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;
    const proposal = await getProposalBySlug(slug);
    const printUrl = new URL(`/p/${slug}/print`, req.nextUrl.origin);
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
    console.error('[pdf] failed to generate proposal pdf:', e);
    return Response.json({ message: 'PDF 생성에 실패했습니다.' }, { status: 500 });
  }
}
