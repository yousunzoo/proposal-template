import { PROJECTS, type Project } from '@/entities/portfolio';

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

/**
 * 포트폴리오 title("뱅크몰 | 대출 비교 플랫폼")을 이름 + 설명으로 분리한다.
 * 첫 조각만 쓰면 "뱅크몰"(비교·상담사·관리자) 처럼 서로 다른 프로젝트가
 * 동일 라벨로 겹쳐 구분되지 않으므로, 설명 조각까지 함께 노출해야 한다.
 */
export function portfolioLabel(title: string): { name: string; descriptor: string } {
  const parts = title
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
  return { name: parts[0] ?? title, descriptor: parts.slice(1).join(' · ') };
}

/** 한 줄 구분 라벨 (칩/목록용) */
export function portfolioLabelText(title: string): string {
  const { name, descriptor } = portfolioLabel(title);
  return descriptor ? `${name} · ${descriptor}` : name;
}

/** 현재 프로젝트를 제외한 관련 프로젝트 3개. scope가 있으면 그 안에서, 없으면 전체에서. */
export function relatedFor(currentSlug: string, scope: string[] = []): Project[] {
  const pool = scope.length ? PROJECTS.filter((p) => scope.includes(p.slug)) : PROJECTS;
  return pool.filter((p) => p.slug !== currentSlug).slice(0, 3);
}
