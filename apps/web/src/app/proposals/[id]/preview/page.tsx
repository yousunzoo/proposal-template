import { notFound } from 'next/navigation';
import { getProposal } from '@/server/proposal/service';
import { ProposalView } from '@/components/proposal/ProposalView';

interface PageProps {
  params: Promise<{ id: string }>;
}

/** 발행 전 미리보기 — id로 조회(발행 여부 무관). 포트폴리오 링크는 preview 하위로. */
export default async function PreviewProposalPage({ params }: PageProps) {
  const { id } = await params;
  let proposal;
  try {
    proposal = await getProposal(id);
  } catch {
    notFound();
  }

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-orange-200 bg-orange-50 px-5 py-2 text-center text-[13px] font-medium text-orange-700">
        미리보기 — 아직 발행되지 않은 제안서입니다.
      </div>
      <ProposalView proposal={proposal} itemBase={`/proposals/${id}/preview/portfolio`} />
    </>
  );
}
