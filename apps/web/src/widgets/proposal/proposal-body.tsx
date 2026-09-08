import type { ProjectInfo, ProposalSectionsData, SectionId } from '@proposal/shared';
import { SECTION_ORDER } from '@proposal/shared';
import {
  HeroSection,
  AboutSection,
  AnalysisSection,
  StrategySection,
  EstimateSection,
  PortfolioSection,
  ArchitectureSection,
  QaSection,
  TimelineSection,
  WarrantySection,
  PromiseSection,
} from '@/widgets/proposal/sections';

/** layout(순서·표시)을 존중해 섹션을 렌더한다. 사이드바 없이 본문만. */
export function ProposalBody({
  doc,
  title,
  info,
  portfolioSlugs,
  itemBase,
}: {
  doc: ProposalSectionsData;
  title: string;
  info: ProjectInfo;
  portfolioSlugs: string[];
  itemBase: string;
}) {
  const layout = doc.layout?.length ? doc.layout : SECTION_ORDER.map((id) => ({ id, visible: true }));

  // 표시되는 섹션의 순서대로 번호 부여(hero 제외). 재정렬·숨김을 반영한다.
  const visible = layout.filter((s) => s.visible);
  const numberOf = new Map<SectionId, string>();
  let n = 0;
  for (const s of visible) {
    if (s.id === 'greeting') continue;
    n += 1;
    numberOf.set(s.id, String(n).padStart(2, '0'));
  }
  const idx = (id: SectionId) => numberOf.get(id) ?? '';

  function render(id: SectionId) {
    switch (id) {
      case 'greeting':
        return <HeroSection key={id} title={title} greeting={doc.greeting} info={info} />;
      case 'about':
        return <AboutSection key={id} about={doc.about} index={idx(id)} />;
      case 'analysis':
        return <AnalysisSection key={id} analysis={doc.analysis} index={idx(id)} />;
      case 'strategy':
        return <StrategySection key={id} strategy={doc.strategy} index={idx(id)} />;
      case 'estimate':
        return <EstimateSection key={id} estimate={doc.estimate} index={idx(id)} />;
      case 'portfolio':
        return (
          <PortfolioSection
            key={id}
            portfolio={doc.portfolio}
            portfolioSlugs={portfolioSlugs}
            itemBase={itemBase}
            index={idx(id)}
          />
        );
      case 'architecture':
        return <ArchitectureSection key={id} architecture={doc.architecture} index={idx(id)} />;
      case 'qa':
        return <QaSection key={id} qa={doc.qa} index={idx(id)} />;
      case 'timeline':
        return <TimelineSection key={id} timeline={doc.timeline} index={idx(id)} />;
      case 'warranty':
        return <WarrantySection key={id} warranty={doc.warranty} index={idx(id)} />;
      case 'promise':
        return <PromiseSection key={id} promise={doc.promise} index={idx(id)} />;
      default:
        return null;
    }
  }

  return <>{visible.map((s) => render(s.id))}</>;
}

/** 현재 표시되는 섹션들의 네비 항목 (id + 라벨) */
export function visibleNav(doc: ProposalSectionsData) {
  const layout = doc.layout?.length ? doc.layout : SECTION_ORDER.map((id) => ({ id, visible: true }));
  return layout.filter((s) => s.visible).map((s) => s.id);
}
