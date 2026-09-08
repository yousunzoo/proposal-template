import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProposalPrintView } from '@/widgets/proposal/proposal-print-view';
import { getProposal } from '@/server/proposal/service';

interface PageProps {
  params: Promise<{ id: string }>;
}

/** PDF 전용 print 뷰 — id로 조회(발행 여부 무관).
 * PDF 생성 시 헤드리스 브라우저가 이 페이지를 열어 렌더링한다. */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const proposal = await getProposal(id);
    return { title: proposal.title, robots: { index: false, follow: false } };
  } catch {
    return { title: '제안서를 찾을 수 없습니다', robots: { index: false, follow: false } };
  }
}

export default async function AdminProposalPrintPage({ params }: PageProps) {
  const { id } = await params;
  let proposal;
  try {
    proposal = await getProposal(id);
  } catch {
    notFound();
  }

  return <ProposalPrintView proposal={proposal} itemBase={`/proposals/${id}/preview/portfolio`} />;
}
