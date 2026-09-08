import {
  ProposalValidationError,
  validateCreateProposalInput,
  validateProposalSectionsData,
  validateUpdateProposalInput,
} from '@proposal/shared';
import { parseProposal } from '../src/server/proposal/parser';
import {
  SAMPLE_INFO,
  SAMPLE_PORTFOLIO,
  SAMPLE_PORTFOLIO_SLUGS,
  SAMPLE_PROPOSAL,
  SAMPLE_TITLE,
} from '../src/shared/config/sample';

function expectValidationFailure(name: string, fn: () => unknown) {
  try {
    fn();
  } catch (e) {
    if (e instanceof ProposalValidationError) return;
    throw e;
  }
  throw new Error(`${name}: validation failure was expected`);
}

const sections = parseProposal(SAMPLE_PROPOSAL, {
  budget: SAMPLE_INFO.budget,
  duration: SAMPLE_INFO.duration,
  hasPortfolioItems: SAMPLE_PORTFOLIO_SLUGS.length > 0,
});

validateProposalSectionsData(sections);
validateCreateProposalInput({
  title: SAMPLE_TITLE,
  projectInfo: SAMPLE_INFO,
  rawProposalContent: SAMPLE_PROPOSAL,
  rawPortfolioContent: SAMPLE_PORTFOLIO,
  portfolioSlugs: SAMPLE_PORTFOLIO_SLUGS,
});
validateUpdateProposalInput({
  title: SAMPLE_TITLE,
  projectInfo: SAMPLE_INFO,
  sections,
  portfolioSlugs: SAMPLE_PORTFOLIO_SLUGS,
});

expectValidationFailure('empty create input', () =>
  validateCreateProposalInput({
    title: '',
    projectInfo: {},
    rawProposalContent: '',
  }),
);

expectValidationFailure('broken sections', () =>
  validateUpdateProposalInput({
    sections: {
      greeting: { title: 1 },
      layout: [],
    },
  }),
);

console.log('Proposal fixture validation passed.');
