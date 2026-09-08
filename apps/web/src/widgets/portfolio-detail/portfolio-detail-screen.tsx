import Image from 'next/image';
import type { Project } from '@/entities/portfolio';
import { PortfolioDetail, type PortfolioNav } from './portfolio-detail';

/** 포트폴리오 상세 전체 화면 (공개/미리보기 라우트 공용) */
export function PortfolioDetailScreen({
  project,
  relatedProjects,
  nav,
}: {
  project: Project;
  relatedProjects: Project[];
  nav: PortfolioNav;
}) {
  const detailContent = project.detail ? (
    <Image
      src={project.detail}
      alt={`${project.title} 상세 이미지`}
      width={1120}
      height={560}
      className="h-auto w-full"
      sizes="(max-width: 1120px) 100vw, 1120px"
    />
  ) : (
    <div className="relative aspect-[16/9] w-full">
      <Image src={project.thumbnail} alt={`${project.title} 썸네일`} fill className="object-cover" />
    </div>
  );

  return (
    <div className="bg-canvas">
      <PortfolioDetail
        project={project}
        detailContent={detailContent}
        relatedProjects={relatedProjects}
        nav={nav}
      />
    </div>
  );
}
