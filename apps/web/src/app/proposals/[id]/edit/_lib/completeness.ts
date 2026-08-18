import type { ProposalSectionsData, SectionId } from '@proposal/shared';

/** 문자열이 실질적으로 채워졌는지 */
function has(v: string | undefined | null): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * 섹션이 "충분히 채워졌는지" 휴리스틱.
 * 배포 전 비어있는 섹션을 Rail 에서 시각적으로 안내하는 용도(강제 아님).
 */
export function isSectionFilled(doc: ProposalSectionsData, id: SectionId): boolean {
  switch (id) {
    case 'greeting':
      return has(doc.greeting.title) || has(doc.greeting.intro) || has(doc.greeting.body);
    case 'about':
      return doc.about.intro.some(has) || doc.about.values.some((v) => has(v.title) || has(v.body));
    case 'team':
      return has(doc.team.intro) || doc.team.groups.some((g) => g.members.length > 0);
    case 'analysis':
      return has(doc.analysis.content);
    case 'strategy':
      return doc.strategy.items.some((it) => has(it.title) || has(it.body));
    case 'estimate':
      return has(doc.estimate.cost) || has(doc.estimate.period) || has(doc.estimate.note);
    case 'portfolio':
      return has(doc.portfolio.description);
    case 'architecture':
      return has(doc.architecture.note) || doc.architecture.layers.some((l) => has(l.label) || has(l.body));
    case 'qa':
      return doc.qa.items.some((it) => has(it.area) || has(it.work));
    case 'timeline':
      return doc.timeline.phases.length > 0;
    case 'warranty':
      return doc.warranty.included.some(has) || doc.warranty.handoff.some((h) => has(h.title));
    case 'promise':
      return has(doc.promise.body) || doc.promise.commitments.some(has);
    default:
      return true;
  }
}

/** 프로젝트 정보(메타) 완성도 — 표지에 쓰이는 핵심 필드 기준 */
export function isProjectInfoFilled(title: string, info: {
  budget?: string;
  duration?: string;
}): boolean {
  return has(title) && (has(info.budget) || has(info.duration));
}
