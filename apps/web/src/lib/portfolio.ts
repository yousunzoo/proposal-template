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

/** 2글자 이상 토큰만 추출(한글·영문·숫자 경계 기준) */
function signalTokens(s: string): string[] {
  return s
    .split(/[^가-힣a-zA-Z0-9]+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length >= 2);
}

/**
 * 제안서 본문 기반으로 관련 포트폴리오 slug를 추천한다.
 * 각 프로젝트의 domain(강)·keyword(중)·platform(약) 신호 토큰이 본문에 등장하는 정도로 점수화한다.
 * 사용자가 포트폴리오를 직접 고르지 않았을 때의 자동 선택용. 일치가 없으면 빈 배열.
 */
export function suggestPortfolioSlugs(text: string, limit = 3): string[] {
  const hay = text.toLowerCase();
  if (!hay.trim()) return [];

  const scored = PROJECTS.map((p) => {
    const counted = new Set<string>();
    let score = 0;
    const add = (raw: string, weight: number) => {
      for (const tok of signalTokens(raw)) {
        if (counted.has(tok)) continue; // 동일 토큰 중복 가산 방지
        if (hay.includes(tok)) {
          counted.add(tok);
          score += weight;
        }
      }
    };
    p.domain.forEach((d) => add(d, 3));
    p.keyword.forEach((k) => add(k, 2));
    p.platform.forEach((pl) => add(pl, 1));
    return { slug: p.slug, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.slug);
}
