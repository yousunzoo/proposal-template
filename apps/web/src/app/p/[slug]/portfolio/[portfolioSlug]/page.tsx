import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROJECTS } from '@/entities/portfolio';
import { PortfolioDetailScreen } from '@/widgets/portfolio-detail/PortfolioDetailScreen';
import { relatedFor } from '@/lib/portfolio';
import { getProposalBySlug } from '@/server/proposal/service';

interface PageProps {
  params: Promise<{ slug: string; portfolioSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { portfolioSlug } = await params;
  const project = PROJECTS.find((p) => p.slug === portfolioSlug);
  if (!project) return { title: '포트폴리오를 찾을 수 없습니다', robots: { index: false } };
  return {
    title: `${project.title} — 포트폴리오`,
    description: `${project.title} · ${project.category}`,
  };
}

export default async function ProposalPortfolioDetailPage({ params }: PageProps) {
  const { slug, portfolioSlug } = await params;

  const project = PROJECTS.find((p) => p.slug === portfolioSlug);
  if (!project) notFound();

  let relatedSlugs: string[] = [];
  try {
    const proposal = await getProposalBySlug(slug);
    relatedSlugs = proposal.portfolioSlugs;
  } catch {
    relatedSlugs = [];
  }

  return (
    <PortfolioDetailScreen
      project={project}
      relatedProjects={relatedFor(project.slug, relatedSlugs)}
      nav={{
        homeHref: `/p/${slug}`,
        listHref: `/p/${slug}#portfolio`,
        listLabel: '관련 포트폴리오',
        itemBase: `/p/${slug}/portfolio`,
        contactHref: `/p/${slug}#promise`,
      }}
    />
  );
}
