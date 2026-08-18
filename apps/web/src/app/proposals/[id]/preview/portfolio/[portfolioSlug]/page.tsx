import { notFound } from 'next/navigation';
import { getProject, relatedFor } from '@/lib/portfolio';
import { PortfolioDetailScreen } from '@/widgets/portfolio-detail/PortfolioDetailScreen';
import { getProposal } from '@/server/proposal/service';

interface PageProps {
  params: Promise<{ id: string; portfolioSlug: string }>;
}

/** 미리보기용 포트폴리오 상세 (id 기준) */
export default async function PreviewPortfolioDetailPage({ params }: PageProps) {
  const { id, portfolioSlug } = await params;
  const project = getProject(portfolioSlug);
  if (!project) notFound();

  let scope: string[] = [];
  try {
    const proposal = await getProposal(id);
    scope = proposal.portfolioSlugs;
  } catch {
    scope = [];
  }

  return (
    <PortfolioDetailScreen
      project={project}
      relatedProjects={relatedFor(project.slug, scope)}
      nav={{
        homeHref: `/proposals/${id}/preview`,
        listHref: `/proposals/${id}/preview#portfolio`,
        listLabel: '관련 포트폴리오',
        itemBase: `/proposals/${id}/preview/portfolio`,
        contactHref: `/proposals/${id}/preview#promise`,
      }}
    />
  );
}
