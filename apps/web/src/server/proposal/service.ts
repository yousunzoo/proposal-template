import type { Proposal } from '@prisma/client';
import type {
  CreateProposalInput,
  ProjectInfo,
  ProposalDto,
  ProposalSectionsData,
  PublishResult,
  UpdateProposalInput,
} from '@proposal/shared';
import { normalizeDoc } from '@proposal/shared';
import { prisma } from '../db';
import { HttpError } from '../http';
import { parseProposal, assembleDoc, parseAmount, parsePeriodDays } from './parser';
import { structure } from './ai-structure';
import { suggestPortfolioSlugs } from '@/lib/portfolio';

/** DB row(JSON 문자열 컬럼) → DTO 변환 */
function toDto(p: Proposal): ProposalDto {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    projectInfo: safeJson<ProjectInfo>(p.projectInfo, {}),
    rawProposalContent: p.rawProposalContent,
    rawPortfolioContent: p.rawPortfolioContent,
    sections: p.sections
      ? normalizeDoc(safeJson<Partial<ProposalSectionsData>>(p.sections, {}))
      : null,
    portfolioSlugs: safeJson<string[]>(p.portfolioSlugs, []),
    published: p.published,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function safeJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** 한글 제목 → URL slug (한글은 제거되므로 랜덤 접미사로 유일성 보장) */
function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/[\s가-힣]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${suffix}` : `proposal-${suffix}`;
}

export async function createProposal(input: CreateProposalInput): Promise<ProposalDto> {
  if (!input?.title?.trim()) throw new HttpError(400, 'title은 필수입니다.');
  if (!input?.rawProposalContent?.trim()) throw new HttpError(400, 'rawProposalContent는 필수입니다.');

  const created = await prisma.proposal.create({
    data: {
      title: input.title.trim(),
      projectInfo: JSON.stringify(input.projectInfo ?? {}),
      rawProposalContent: input.rawProposalContent,
      rawPortfolioContent: input.rawPortfolioContent ?? '',
      portfolioSlugs: JSON.stringify(input.portfolioSlugs ?? []),
    },
  });
  return toDto(created);
}

export async function getProposal(id: string): Promise<ProposalDto> {
  const p = await prisma.proposal.findUnique({ where: { id } });
  if (!p) throw new HttpError(404, '제안서를 찾을 수 없습니다.');
  return toDto(p);
}

export async function getProposalBySlug(slug: string): Promise<ProposalDto> {
  const p = await prisma.proposal.findUnique({ where: { slug } });
  if (!p || !p.published) throw new HttpError(404, '발행된 제안서를 찾을 수 없습니다.');
  return toDto(p);
}

export async function listProposals(): Promise<ProposalDto[]> {
  const rows = await prisma.proposal.findMany({ orderBy: { updatedAt: 'desc' } });
  return rows.map(toDto);
}

/** 원본 → 섹션 데이터 파싱 후 저장 (AI 우선, 실패 시 결정론 파서) */
export async function generateProposal(id: string): Promise<ProposalDto> {
  const p = await prisma.proposal.findUnique({ where: { id } });
  if (!p) throw new HttpError(404, '제안서를 찾을 수 없습니다.');

  const info = safeJson<ProjectInfo>(p.projectInfo, {});
  const selectedSlugs = safeJson<string[]>(p.portfolioSlugs, []);
  // 사용자가 관련 포트폴리오를 직접 고르지 않았으면 본문 기반으로 자동 추천한다.
  const portfolioSlugs = selectedSlugs.length
    ? selectedSlugs
    : suggestPortfolioSlugs(
        `${p.rawProposalContent}\n${p.rawPortfolioContent}\n${info.skills ?? ''}`,
      );
  const hasPortfolioItems = portfolioSlugs.length > 0;

  let sections: ProposalSectionsData;
  const parts = await structure(p.rawProposalContent, p.rawPortfolioContent);
  if (parts) {
    if (!parts.estimate.cost && info.budget) {
      parts.estimate.cost = info.budget;
      parts.estimate.costValue = parseAmount(info.budget);
    }
    if (!parts.estimate.period && info.duration) {
      parts.estimate.period = info.duration;
      parts.estimate.periodValue = parsePeriodDays(info.duration);
    }
    sections = assembleDoc(parts, { hasPortfolioItems });
  } else {
    sections = parseProposal(p.rawProposalContent, {
      budget: info.budget,
      duration: info.duration,
      hasPortfolioItems,
    });
  }

  const updated = await prisma.proposal.update({
    where: { id },
    data: {
      sections: JSON.stringify(sections),
      // 자동 추천분은 저장해 편집·발행에도 반영한다(직접 고른 경우는 건드리지 않음).
      ...(selectedSlugs.length ? {} : { portfolioSlugs: JSON.stringify(portfolioSlugs) }),
    },
  });
  return toDto(updated);
}

/** 섹션/제목/포트폴리오 편집 저장 */
export async function updateProposal(id: string, input: UpdateProposalInput): Promise<ProposalDto> {
  const p = await prisma.proposal.findUnique({ where: { id } });
  if (!p) throw new HttpError(404, '제안서를 찾을 수 없습니다.');

  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.projectInfo !== undefined) data.projectInfo = JSON.stringify(input.projectInfo);
  if (input.sections !== undefined) data.sections = JSON.stringify(input.sections);
  if (input.portfolioSlugs !== undefined) data.portfolioSlugs = JSON.stringify(input.portfolioSlugs);

  const updated = await prisma.proposal.update({ where: { id }, data });
  return toDto(updated);
}

/** 발행: slug 발급 + published=true. 섹션이 없으면 먼저 파싱. */
export async function publishProposal(id: string, origin: string): Promise<PublishResult> {
  const p = await prisma.proposal.findUnique({ where: { id } });
  if (!p) throw new HttpError(404, '제안서를 찾을 수 없습니다.');

  if (!p.sections) await generateProposal(id);

  let slug = p.slug;
  if (!slug) {
    for (let i = 0; i < 5; i += 1) {
      const candidate = slugify(p.title);
      const exists = await prisma.proposal.findUnique({ where: { slug: candidate } });
      if (!exists) {
        slug = candidate;
        break;
      }
    }
  }
  if (!slug) throw new HttpError(400, 'slug 생성에 실패했습니다.');

  await prisma.proposal.update({ where: { id }, data: { slug, published: true } });

  const base = (process.env.WEB_ORIGIN || origin).replace(/\/$/, '');
  return { slug, url: `${base}/p/${slug}`, published: true };
}

export async function unpublishProposal(id: string): Promise<ProposalDto> {
  const p = await prisma.proposal.findUnique({ where: { id } });
  if (!p) throw new HttpError(404, '제안서를 찾을 수 없습니다.');
  const updated = await prisma.proposal.update({ where: { id }, data: { published: false } });
  return toDto(updated);
}

export async function removeProposal(id: string): Promise<{ ok: true }> {
  await prisma.proposal.delete({ where: { id } }).catch(() => {
    throw new HttpError(404, '제안서를 찾을 수 없습니다.');
  });
  return { ok: true };
}
