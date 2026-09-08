import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProposalPrintView } from '@/widgets/proposal/proposal-print-view';
import { getProposalBySlug } from '@/server/proposal/service';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const proposal = await getProposalBySlug(slug);
    return {
      title: proposal.title,
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: '제안서를 찾을 수 없습니다', robots: { index: false, follow: false } };
  }
}

export default async function PublicProposalPrintPage({ params }: PageProps) {
  const { slug } = await params;
  let proposal;
  try {
    proposal = await getProposalBySlug(slug);
  } catch {
    notFound();
  }

  return <ProposalPrintView proposal={proposal} itemBase={`/p/${slug}/portfolio`} />;
}
