import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProposalBySlug } from '@/server/proposal/service';
import { ProposalView } from '@/widgets/proposal/proposal-view';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const proposal = await getProposalBySlug(slug);
    return {
      title: proposal.title,
      description: proposal.title,
    };
  } catch {
    return { title: '제안서를 찾을 수 없습니다', robots: { index: false } };
  }
}

export default async function PublicProposalPage({ params }: PageProps) {
  const { slug } = await params;
  let proposal;
  try {
    proposal = await getProposalBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <ProposalView
      proposal={proposal}
      itemBase={`/p/${slug}/portfolio`}
      pdfHref={`/api/proposals/public/${slug}/pdf`}
    />
  );
}
