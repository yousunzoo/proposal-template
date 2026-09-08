import type { ProposalDto } from '@proposal/shared';
import { ProposalBody } from './proposal-body';

/** PDF 전용 제안서 뷰. 화면 네비게이션을 제거하고 섹션 본문만 렌더한다. */
export function ProposalPrintView({
  proposal,
  itemBase,
}: {
  proposal: ProposalDto;
  itemBase: string;
}) {
  const s = proposal.sections;
  if (!s) {
    return (
      <div className="shell px-5 py-24 text-center text-ink-500">
        아직 생성되지 않은 제안서입니다.
      </div>
    );
  }

  return (
    <div data-proposal-print>
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
  );
}
