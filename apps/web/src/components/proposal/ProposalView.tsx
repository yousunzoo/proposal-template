'use client';

import type { ProposalDto } from '@proposal/shared';
import { SECTION_LABELS } from '@proposal/shared';
import { MotionRoot } from './reveal';
import { SidebarNav, type NavItem } from './SidebarNav';
import { ProposalBody, visibleNav } from './ProposalBody';

/** 발행 제안서 전체 뷰 — 사이드바 스크롤 네비 + layout 기반 섹션 */
export function ProposalView({
  proposal,
  itemBase,
  pdfHref,
}: {
  proposal: ProposalDto;
  itemBase: string;
  pdfHref?: string;
}) {
  const s = proposal.sections;
  if (!s) {
    return (
      <div className="shell px-5 py-24 text-center text-ink-500">
        아직 생성되지 않은 제안서입니다.
      </div>
    );
  }

  const nav: NavItem[] = visibleNav(s).map((id) => ({ id, label: SECTION_LABELS[id] }));

  return (
    <MotionRoot>
      <SidebarNav items={nav} title={proposal.title} pdfHref={pdfHref} />
      <div data-proposal-content className="lg:pl-[248px]">
        <main>
          <ProposalBody
            doc={s}
            title={proposal.title}
            info={proposal.projectInfo}
            portfolioSlugs={proposal.portfolioSlugs}
            itemBase={itemBase}
          />
        </main>
      </div>
    </MotionRoot>
  );
}
