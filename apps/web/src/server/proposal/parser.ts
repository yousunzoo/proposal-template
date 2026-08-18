import type {
  ContentBlock,
  ProposalSectionsData,
  SectionId,
  SectionLayoutItem,
} from '@proposal/shared';
import { DEFAULT_GREETING_INTRO, DEFAULT_TITLES, SECTION_ORDER, blocksToMarkdown } from '@proposal/shared';
import {
  DEFAULT_ABOUT_INTRO,
  DEFAULT_ABOUT_VALUES,
  DEFAULT_ARCH_LAYERS,
  DEFAULT_ARCH_NOTE,
  DEFAULT_QA,
  DEFAULT_STRATEGY,
  DEFAULT_TEAM_BULLETS,
  DEFAULT_TEAM_GROUPS,
  DEFAULT_TEAM_INTRO,
  DEFAULT_WARRANTY_EXCLUDED,
  DEFAULT_WARRANTY_HANDOFF,
  DEFAULT_WARRANTY_INCLUDED,
  buildDefaultTimeline,
} from './defaults';

/** 로컬 견적 타입 (parseEstimate 반환) */
interface EstimateData {
  cost: string;
  costValue: number | null;
  period: string;
  periodValue: number | null;
  warranty: string;
  note: string;
}

/**
 * 제안서 원본 텍스트를 템플릿 섹션 데이터로 결정론적 변환한다.
 * 원본은 `◼︎ 인사말 / ◼︎ 프로젝트 분석 / ◼︎ 견적 요약 / ◼︎ 성공을 향한 약속`
 * 형태의 마커 섹션으로 구성된다고 가정한다. (마커/제목이 없으면 안전한 기본값으로 폴백)
 */

interface RawSection {
  title: string;
  body: string;
}

/** 최상위 섹션명으로 인정하는 키워드 (숫자 헤더 오검출 방지용) */
const KNOWN_SECTION =
  /(인사말|인사|프로젝트\s*개요|개요|유사\s*포트폴리오|관련\s*포트폴리오|포트폴리오|프로젝트\s*분석|분석|실행\s*전략|견적\s*요약|견적|비용\s*요약|성공을\s*향한\s*약속|약속|맺음말)/;

/**
 * 최상위 섹션 분해. 두 형식을 모두 인식한다.
 *  1) `◼︎ 인사말` 등 마커 헤더
 *  2) `1. 인사말` 등 숫자.제목 헤더 (제목이 알려진 섹션명일 때만; `1)`·`가.`·문장형은 하위 항목이므로 제외)
 */
function splitSections(raw: string): RawSection[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const sections: RawSection[] = [];
  let current: RawSection | null = null;

  for (const line of lines) {
    let title: string | null = null;

    const marker = line.match(/^\s*[◼◾▪■]︎?\s*(.+?)\s*$/u);
    if (marker) {
      title = marker[1].trim();
    } else {
      const num = line.match(/^\s*\d+\.\s+(.{1,24})\s*$/);
      if (num) {
        const t = num[1].trim();
        // 짧고, 알려진 섹션명이며, 문장(마침표/설명)으로 끝나지 않을 때만 헤더로 인정
        if (KNOWN_SECTION.test(t) && !/[.!?]$/.test(t)) title = t;
      }
    }

    if (title !== null) {
      current = { title, body: '' };
      sections.push(current);
    } else if (current) {
      current.body += line + '\n';
    }
  }
  return sections;
}

/** 문단(빈 줄 2개 이상 기준)으로 분리 */
function toParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
}

/** 프로젝트 분석 본문을 lead + 콘텐츠 블록으로 파싱 */
function parseAnalysis(body: string): { lead: string; blocks: ContentBlock[] } {
  const paragraphs = toParagraphs(body);
  const blocks: ContentBlock[] = [];
  let lead = '';
  let featureCount = 0;
  let currentFeature: Extract<ContentBlock, { kind: 'feature' }> | null = null;

  for (const para of paragraphs) {
    const paraLines = para
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    // [소제목] / 가.·나. 형태 헤딩
    const single = paraLines.length === 1 ? paraLines[0] : '';
    const bracket = single.match(/^\[(.+)\]$/);
    const koHeading = single.match(/^[가-힣]\.\s+(.+)$/);
    if (bracket || koHeading) {
      currentFeature = null;
      const headingText = bracket ? bracket[1] : koHeading ? koHeading[1] : '';
      blocks.push({ kind: 'heading', text: headingText.trim() });
      continue;
    }

    // "N. 제목" / "N) 제목"으로 시작하는 문단 → feature.
    // 제목 다음 줄에 본문이 빈 줄 없이 이어져도(가장 흔한 서술 방식) 올바로 분리한다.
    // 한 문단에 번호 줄이 여러 개면 각각 별도 feature, 비번호 줄은 직전 feature 본문으로 이어붙인다.
    // (모든 줄이 어딘가에 담기므로 내용 소실이 없다)
    if (/^\d+[.)]\s+/.test(paraLines[0])) {
      for (const line of paraLines) {
        const m = line.match(/^\d+[.)]\s+(.+)$/);
        if (m) {
          featureCount += 1;
          currentFeature = {
            kind: 'feature',
            index: String(featureCount).padStart(2, '0'),
            title: m[1].trim(),
            body: '',
          };
          blocks.push(currentFeature);
        } else if (currentFeature) {
          currentFeature.body = currentFeature.body ? `${currentFeature.body} ${line}` : line;
        }
      }
      continue;
    }

    // 불릿 리스트
    if (paraLines.length > 0 && paraLines.every((l) => /^[-•]\s+/.test(l))) {
      currentFeature = null;
      blocks.push({
        kind: 'list',
        items: paraLines.map((l) => l.replace(/^[-•]\s+/, '').trim()),
      });
      continue;
    }

    // 첫째·둘째·셋째… 서수 열거 → 리스트로 승격.
    // (한 문단에 뭉쳐 run-on 문장이 되는 것을 막고 핵심 포인트를 스캔 가능하게 한다)
    const ORDINAL = /^(첫째|둘째|셋째|넷째|다섯째|여섯째|일곱째)\s*[,.·、]?\s*(.+)$/;
    if (paraLines.length > 1 && paraLines.filter((l) => ORDINAL.test(l)).length >= 2) {
      currentFeature = null;
      blocks.push({
        kind: 'list',
        items: paraLines.map((l) => {
          const m = l.match(ORDINAL);
          return (m ? m[2] : l).trim();
        }),
      });
      continue;
    }

    const text = paraLines.join(' ');
    if (currentFeature) {
      currentFeature.body = currentFeature.body ? `${currentFeature.body} ${text}` : text;
    } else if (!lead) {
      lead = text;
    } else {
      blocks.push({ kind: 'paragraph', text });
    }
  }

  return { lead, blocks };
}

/** 금액 문자열 → 숫자 (억·만·원, 콤마 지원) */
export function parseAmount(s: string): number | null {
  if (!s) return null;
  const clean = s.replace(/[,\s원]/g, '');
  let total = 0;
  let matched = false;
  const eok = clean.match(/([\d.]+)\s*억/);
  if (eok) {
    total += parseFloat(eok[1]) * 1e8;
    matched = true;
  }
  const man = clean.match(/([\d.]+)\s*만/);
  if (man) {
    total += parseFloat(man[1]) * 1e4;
    matched = true;
  }
  if (matched) return Math.round(total);
  const d = clean.replace(/[^\d]/g, '');
  return d ? Number(d) : null;
}

/** 기간 문자열 → 일수 (주·일·개월, 범위면 최댓값) */
export function parsePeriodDays(s: string): number | null {
  if (!s) return null;
  const weeks = [...s.matchAll(/(\d+)\s*주/g)].map((m) => Number(m[1]));
  if (weeks.length) return Math.max(...weeks) * 7;
  const days = s.match(/(\d+)\s*일/);
  if (days) return Number(days[1]);
  const months = s.match(/(\d+)\s*개월/);
  if (months) return Number(months[1]) * 30;
  return null;
}

/** 견적 섹션 파싱 (비용·기간·하자보수·비고). 다양한 표기 지원. */
function parseEstimate(body: string, fallbackBudget?: string, fallbackDuration?: string): EstimateData {
  const text = body.replace(/\r\n/g, '\n');

  const costLine = text.match(/비용\s*[:：]\s*([^\n]+)/) || text.match(/비용\s*[:：]?\s*([0-9,][^\n]*(?:원|만|억)[^\n]*)/);
  const cost = costLine ? costLine[1].replace(/\s{2,}/g, ' ').trim() : (fallbackBudget ?? '');

  const periodLine =
    text.match(/(?<!하자보수\s?)기간\s*[:：]\s*([^\n]+)/) ||
    text.match(/(?<!하자보수\s?)기간\s*[:：]?\s*(약?\s*[0-9][^\n]*(?:주|일|개월)[^\n]*)/);
  const period = periodLine ? periodLine[1].replace(/\s{2,}/g, ' ').trim() : (fallbackDuration ?? '');

  const w =
    text.match(/(\d+\s*(?:개월|주|일|년))\s*(?:간\s*)?(?:무상|무료)\s*(?:유지\s*보수|하자보수)/) ||
    text.match(/(?:하자보수|유지\s*보수)[^\n]*?(\d+\s*(?:개월|주|일|년))/) ||
    text.match(/(\d+\s*(?:개월|주|일|년))[^\n]*?(?:무상|무료|유지\s*보수|하자보수)/);
  const warranty = w ? w[1].replace(/\s+/g, '') : '';

  let note = '';
  const noteMark = text.match(/^\s*※\s*(.+)$/m);
  if (noteMark) {
    note = noteMark[1].trim();
  } else {
    const prose = toParagraphs(text).filter(
      (p) => !/^[-•]/.test(p) && !/^\s*(비용|기간|포함\s*범위|제외\s*범위)\s*[:：]/.test(p) && p.length > 25,
    );
    if (prose.length) note = prose[prose.length - 1];
  }

  return {
    cost,
    costValue: parseAmount(cost),
    period,
    periodValue: parsePeriodDays(period),
    warranty,
    note,
  };
}

/** 성공을 향한 약속에서 첫째/둘째/… 다짐 문장 추출 (여러 줄 문단의 첫 줄 기준) */
function parseCommitments(paragraphs: string[]): string[] {
  const commitments: string[] = [];
  for (const p of paragraphs) {
    const firstLine = p.split('\n')[0].trim();
    const m = firstLine.match(/^(첫째|둘째|셋째|넷째|다섯째)\s*[,.]?\s*(.+)$/);
    if (m) {
      const sentence = m[2].split(/(?<=[.!?])\s/)[0].trim();
      commitments.push(sentence);
    }
  }
  return commitments;
}

export interface ParseContext {
  budget?: string;
  duration?: string;
  /** 선택된 관련 포트폴리오가 있는지(포트폴리오 섹션 표시 판단용) */
  hasPortfolioItems?: boolean;
}

/** 원본 → 섹션 데이터 */
export function parseProposal(raw: string, ctx: ParseContext = {}): ProposalSectionsData {
  const sections = splitSections(raw);

  const portfolioSec = sections.find((s) => /포트폴리오/.test(s.title));
  const greetingSec = sections.find(
    (s) => /(인사말|인사|프로젝트\s*개요|개요)/.test(s.title) && !/포트폴리오|분석|견적|약속/.test(s.title),
  );
  const analysisSec = sections.find((s) => /분석/.test(s.title));
  const estimateSec = sections.find((s) => /(견적|비용\s*요약|금액)/.test(s.title));
  const promiseSec = sections.find((s) => /(약속|맺음말)/.test(s.title));

  // 인사말
  const greetingBody = greetingSec ? toParagraphs(greetingSec.body).join('\n\n') : '';

  // 유사/관련 포트폴리오 (프리 텍스트 설명)
  const portfolioDesc = portfolioSec ? toParagraphs(portfolioSec.body).join('\n\n') : '';

  // 프로젝트 분석
  const analysis = analysisSec
    ? parseAnalysis(analysisSec.body)
    : { lead: '', blocks: [] as ContentBlock[] };

  // 견적
  const estimate = parseEstimate(
    estimateSec?.body ?? '',
    ctx.budget,
    ctx.duration,
  );

  // 성공을 향한 약속
  const promiseParagraphs = promiseSec ? toParagraphs(promiseSec.body) : [];
  const commitments = parseCommitments(promiseParagraphs);
  const promiseBody = promiseParagraphs
    .filter((p) => !/^(첫째|둘째|셋째|넷째|다섯째)/.test(p))
    .join('\n\n');

  return assembleDoc(
    {
      greetingBody,
      analysisMarkdown: blocksToMarkdown(analysis.lead, analysis.blocks),
      estimate,
      promiseBody,
      commitments,
      portfolioDesc,
    },
    { hasPortfolioItems: ctx.hasPortfolioItems },
  );
}

/** 원문에서 도출된 부분(결정론/AI 공통). 나머지 섹션은 assembleDoc이 기본값으로 채운다. */
export interface DerivedParts {
  greetingBody: string;
  analysisMarkdown: string;
  estimate: EstimateData;
  promiseBody: string;
  commitments: string[];
  portfolioDesc: string;
}

/** 문자열이 실질적으로 채워졌는지 */
function has(v: string | undefined | null): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * AI 정제/파서 결과에 실제 내용이 있는 콘텐츠 섹션만 표시하는 적응형 레이아웃.
 * - 표지(greeting)와 회사 소개용 고정 섹션(about·team·strategy·architecture·qa·timeline·warranty)은 항상 표시한다.
 * - 원문에서 도출되는 analysis·estimate·portfolio·promise는 내용이 있을 때만 표시한다.
 *   (편집 화면에서 사용자가 언제든 다시 켤 수 있으므로 기본값일 뿐 강제 아님)
 */
function adaptiveLayout(parts: DerivedParts, hasPortfolioItems: boolean): SectionLayoutItem[] {
  const derived: Partial<Record<SectionId, boolean>> = {
    analysis: has(parts.analysisMarkdown),
    estimate: has(parts.estimate.cost) || has(parts.estimate.period) || has(parts.estimate.note),
    portfolio: has(parts.portfolioDesc) || hasPortfolioItems,
    promise: has(parts.promiseBody) || parts.commitments.some(has),
  };
  return SECTION_ORDER.map((id) => ({ id, visible: derived[id] ?? true }));
}

/** 도출된 부분 + 기본 시드 → 완전한 제안서 문서. 결정론 파서와 AI 구조화가 공유한다. */
export function assembleDoc(
  parts: DerivedParts,
  opts: { hasPortfolioItems?: boolean } = {},
): ProposalSectionsData {
  const totalWeeks = parts.estimate.periodValue
    ? Math.max(5, Math.round(parts.estimate.periodValue / 7))
    : 9;
  const ganttWeeks = Math.min(12, totalWeeks);

  return {
    greeting: { title: DEFAULT_TITLES.greeting, intro: DEFAULT_GREETING_INTRO, body: parts.greetingBody },
    about: {
      title: DEFAULT_TITLES.about,
      intro: DEFAULT_ABOUT_INTRO,
      values: DEFAULT_ABOUT_VALUES,
    },
    team: {
      title: DEFAULT_TITLES.team,
      intro: DEFAULT_TEAM_INTRO,
      groups: DEFAULT_TEAM_GROUPS,
      bullets: DEFAULT_TEAM_BULLETS,
    },
    analysis: {
      title: DEFAULT_TITLES.analysis,
      content: parts.analysisMarkdown,
    },
    strategy: {
      title: DEFAULT_TITLES.strategy,
      items: DEFAULT_STRATEGY,
    },
    estimate: {
      title: DEFAULT_TITLES.estimate,
      ...parts.estimate,
    },
    portfolio: { title: DEFAULT_TITLES.portfolio, description: parts.portfolioDesc },
    architecture: {
      title: DEFAULT_TITLES.architecture,
      note: DEFAULT_ARCH_NOTE,
      layers: DEFAULT_ARCH_LAYERS,
    },
    qa: {
      title: DEFAULT_TITLES.qa,
      items: DEFAULT_QA,
    },
    timeline: {
      title: DEFAULT_TITLES.timeline,
      totalWeeks: ganttWeeks,
      phases: buildDefaultTimeline(ganttWeeks),
    },
    warranty: {
      title: DEFAULT_TITLES.warranty,
      included: DEFAULT_WARRANTY_INCLUDED,
      excluded: DEFAULT_WARRANTY_EXCLUDED,
      handoff: DEFAULT_WARRANTY_HANDOFF,
    },
    promise: {
      title: DEFAULT_TITLES.promise,
      body: parts.promiseBody,
      commitments: parts.commitments,
    },
    layout: adaptiveLayout(parts, opts.hasPortfolioItems ?? false),
  };
}
