import { PrismaClient } from '@prisma/client';
import { parseProposal } from '../src/server/proposal/parser';
import {
  SAMPLE_INFO,
  SAMPLE_PORTFOLIO,
  SAMPLE_PORTFOLIO_SLUGS,
  SAMPLE_PROPOSAL,
  SAMPLE_TITLE,
} from '../src/shared/config/sample';

const prisma = new PrismaClient();

/** 홈의 "발행 예시 보기 →" 링크(/p/sample-culture-center)가 가리키는 공개 예시 제안서 */
const SAMPLE_SLUG = 'sample-culture-center';

async function main() {
  // 원본 → 섹션 데이터: 발행 흐름과 동일하게 결정론 파서 사용(AI 미의존)
  const sections = parseProposal(SAMPLE_PROPOSAL, {
    budget: SAMPLE_INFO.budget,
    duration: SAMPLE_INFO.duration,
    hasPortfolioItems: SAMPLE_PORTFOLIO_SLUGS.length > 0,
  });

  const data = {
    title: SAMPLE_TITLE,
    projectInfo: JSON.stringify(SAMPLE_INFO),
    rawProposalContent: SAMPLE_PROPOSAL,
    rawPortfolioContent: SAMPLE_PORTFOLIO,
    sections: JSON.stringify(sections),
    portfolioSlugs: JSON.stringify(SAMPLE_PORTFOLIO_SLUGS),
    published: true,
  };

  await prisma.proposal.upsert({
    where: { slug: SAMPLE_SLUG },
    update: data,
    create: { slug: SAMPLE_SLUG, ...data },
  });

  console.log(`✔ 발행 예시 시드 완료 → /p/${SAMPLE_SLUG}`);
}

main()
  .catch((e) => {
    console.error('시드 실패:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
