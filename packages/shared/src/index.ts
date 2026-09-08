/**
 * 제안서 템플릿 공유 타입.
 * web(Next.js)와 api(Nest.js)가 함께 사용하는 DTO·섹션 모델을 정의한다.
 *
 * v2: 모든 섹션 콘텐츠를 제안서별 데이터로 보유(고정 섹션 포함) + 섹션 title + layout(순서/표시).
 */

/* ────────────────────────────────────────────────────────────
 * 콘텐츠 블록 (PortfolioDetail.parseContent 패턴 재사용)
 * ──────────────────────────────────────────────────────────── */
export type ContentBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'feature'; index: string; title: string; body: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'paragraph'; text: string };

/* ────────────────────────────────────────────────────────────
 * 프로젝트 정보
 * ──────────────────────────────────────────────────────────── */
export interface ProjectInfo {
  skills?: string;
  budget?: string;
  duration?: string;
}

/* ────────────────────────────────────────────────────────────
 * 하위 아이템 타입
 * ──────────────────────────────────────────────────────────── */
export interface StrategyItem {
  index: string;
  title: string;
  body: string;
  tag: string;
}

export interface ArchLayer {
  key: string;
  label: string;
  body: string;
}

export interface QaItem {
  area: string;
  work: string;
  done: string;
}

export interface TimelinePhase {
  label: string;
  span: string;
  start: number;
  end: number;
}

export interface AboutValue {
  title: string;
  body: string;
}

export interface HandoffItem {
  title: string;
  body: string;
}

/* ────────────────────────────────────────────────────────────
 * 섹션 식별자 / 레이아웃
 * ──────────────────────────────────────────────────────────── */
export type SectionId =
  | 'greeting'
  | 'about'
  | 'analysis'
  | 'strategy'
  | 'estimate'
  | 'portfolio'
  | 'architecture'
  | 'qa'
  | 'timeline'
  | 'warranty'
  | 'promise';

export interface SectionLayoutItem {
  id: SectionId;
  visible: boolean;
}

/** 기본 섹션 순서 */
export const SECTION_ORDER: SectionId[] = [
  'greeting',
  'about',
  'analysis',
  'strategy',
  'estimate',
  'portfolio',
  'architecture',
  'qa',
  'timeline',
  'warranty',
  'promise',
];

/** 사이드바 네비 라벨 (편집 제목과 별개로 고정) */
export const SECTION_LABELS: Record<SectionId, string> = {
  greeting: '인사말',
  about: '회사 소개',
  analysis: '프로젝트 분석',
  strategy: '실행 전략',
  estimate: '견적 요약',
  portfolio: '관련 포트폴리오',
  architecture: '시스템 아키텍처',
  qa: 'QA 계획',
  timeline: '진행 일정',
  warranty: '하자보수·인수인계',
  promise: '성공을 향한 약속',
};

/** 섹션 인페이지 헤드라인 기본값 */
export const DEFAULT_TITLES: Record<SectionId, string> = {
  greeting: '',
  about: '자사 서비스를 직접 운영해온 개발사입니다',
  analysis: '프로젝트 분석',
  strategy: '4가지 실행 전략으로 접근합니다',
  estimate: '검수·테스트까지 포함한 턴키 견적입니다',
  portfolio: '관련 프로젝트 노하우로 완성도를 높입니다',
  architecture: '시스템 아키텍처',
  qa: '놓치기 쉬운 부분까지 꼼꼼하게 QA합니다',
  timeline: '주차별 일정으로 진행합니다',
  warranty: '운영 초기 안정화와 인수인계를 지원합니다',
  promise: '성공을 향한 약속',
};

/** 인사말 기본 도입 문구. 제안서별로 수정 가능하며, 신규/레거시 문서의 초기값으로만 사용한다. */
export const DEFAULT_GREETING_INTRO =
  '제안 기회를 주셔서 감사합니다. 요구사항을 면밀히 검토해, 이번 프로젝트에 가장 적합하다고 판단한 방향을 이 제안서에 담았습니다.';

/* ────────────────────────────────────────────────────────────
 * 제안서 문서 (DB sections Json 컬럼에 저장)
 * ──────────────────────────────────────────────────────────── */
export interface ProposalSectionsData {
  greeting: { title: string; intro: string; body: string };
  about: { title: string; intro: string[]; values: AboutValue[] };
  analysis: { title: string; content: string };
  strategy: { title: string; items: StrategyItem[] };
  estimate: {
    title: string;
    cost: string;
    costValue: number | null;
    period: string;
    periodValue: number | null;
    warranty: string;
    note: string;
  };
  portfolio: { title: string; description?: string };
  architecture: { title: string; note: string; layers: ArchLayer[] };
  qa: { title: string; items: QaItem[] };
  timeline: { title: string; totalWeeks: number; phases: TimelinePhase[] };
  warranty: { title: string; included: string[]; excluded: string[]; handoff: HandoffItem[] };
  promise: { title: string; body: string; commitments: string[] };
  layout: SectionLayoutItem[];
}

/* ────────────────────────────────────────────────────────────
 * API DTO
 * ──────────────────────────────────────────────────────────── */
export interface CreateProposalInput {
  title: string;
  projectInfo: ProjectInfo;
  rawProposalContent: string;
  rawPortfolioContent?: string;
  portfolioSlugs?: string[];
}

export interface UpdateProposalInput {
  title?: string;
  projectInfo?: ProjectInfo;
  sections?: ProposalSectionsData;
  portfolioSlugs?: string[];
}

export interface ProposalDto {
  id: string;
  slug: string | null;
  title: string;
  projectInfo: ProjectInfo;
  rawProposalContent: string;
  rawPortfolioContent: string;
  sections: ProposalSectionsData | null;
  portfolioSlugs: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublishResult {
  slug: string;
  url: string;
  published: boolean;
}

/** 기본 레이아웃(전부 표시) */
export function defaultLayout(): SectionLayoutItem[] {
  return SECTION_ORDER.map((id) => ({ id, visible: true }));
}

/* ────────────────────────────────────────────────────────────
 * 런타임 검증
 * 외부 입력이 타입 단언만으로 DB에 저장되지 않도록 API/서비스 계층에서 사용한다.
 * ──────────────────────────────────────────────────────────── */

export class ProposalValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(issues.join(', '));
    this.name = 'ProposalValidationError';
  }
}

const MAX_TITLE = 200;
const MAX_SHORT_TEXT = 2_000;
const MAX_LONG_TEXT = 200_000;
const MAX_LIST_ITEMS = 100;
const SECTION_SET = new Set<string>(SECTION_ORDER);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pushIssue(issues: string[], path: string, message: string): void {
  issues.push(`${path}: ${message}`);
}

function readObject(value: unknown, path: string, issues: string[]): Record<string, unknown> {
  if (isRecord(value)) return value;
  pushIssue(issues, path, '객체여야 합니다.');
  return {};
}

function readString(
  value: unknown,
  path: string,
  issues: string[],
  opts: { max?: number; nonEmpty?: boolean } = {},
): string {
  if (typeof value !== 'string') {
    pushIssue(issues, path, '문자열이어야 합니다.');
    return '';
  }
  if (opts.nonEmpty && !value.trim()) pushIssue(issues, path, '비어 있을 수 없습니다.');
  if (opts.max && value.length > opts.max) {
    pushIssue(issues, path, `${opts.max}자를 넘을 수 없습니다.`);
  }
  return value;
}

function readOptionalString(
  value: unknown,
  path: string,
  issues: string[],
  max = MAX_SHORT_TEXT,
): string | undefined {
  if (value === undefined) return undefined;
  return readString(value, path, issues, { max });
}

function readNullableNumber(value: unknown, path: string, issues: string[]): number | null {
  if (value === null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  pushIssue(issues, path, '숫자 또는 null이어야 합니다.');
  return null;
}

function readPositiveInteger(value: unknown, path: string, issues: string[]): number {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  pushIssue(issues, path, '양의 정수여야 합니다.');
  return 1;
}

function readBoolean(value: unknown, path: string, issues: string[]): boolean {
  if (typeof value === 'boolean') return value;
  pushIssue(issues, path, 'boolean이어야 합니다.');
  return false;
}

function readStringArray(
  value: unknown,
  path: string,
  issues: string[],
  opts: { maxItems?: number; maxText?: number } = {},
): string[] {
  if (!Array.isArray(value)) {
    pushIssue(issues, path, '배열이어야 합니다.');
    return [];
  }
  const maxItems = opts.maxItems ?? MAX_LIST_ITEMS;
  if (value.length > maxItems) pushIssue(issues, path, `${maxItems}개를 넘을 수 없습니다.`);
  return value.map((item, index) =>
    readString(item, `${path}[${index}]`, issues, { max: opts.maxText ?? MAX_SHORT_TEXT }),
  );
}

function readProjectInfo(value: unknown, path: string, issues: string[]): ProjectInfo {
  if (value === undefined) return {};
  const src = readObject(value, path, issues);
  return {
    skills: readOptionalString(src.skills, `${path}.skills`, issues),
    budget: readOptionalString(src.budget, `${path}.budget`, issues),
    duration: readOptionalString(src.duration, `${path}.duration`, issues),
  };
}

function readAboutValues(value: unknown, path: string, issues: string[]): AboutValue[] {
  if (!Array.isArray(value)) {
    pushIssue(issues, path, '배열이어야 합니다.');
    return [];
  }
  return value.map((item, index) => {
    const row = readObject(item, `${path}[${index}]`, issues);
    return {
      title: readString(row.title, `${path}[${index}].title`, issues, { max: MAX_SHORT_TEXT }),
      body: readString(row.body, `${path}[${index}].body`, issues, { max: MAX_LONG_TEXT }),
    };
  });
}

function readStrategyItems(value: unknown, path: string, issues: string[]): StrategyItem[] {
  if (!Array.isArray(value)) {
    pushIssue(issues, path, '배열이어야 합니다.');
    return [];
  }
  return value.map((item, index) => {
    const row = readObject(item, `${path}[${index}]`, issues);
    return {
      index: readString(row.index, `${path}[${index}].index`, issues, { max: 20 }),
      title: readString(row.title, `${path}[${index}].title`, issues, { max: MAX_SHORT_TEXT }),
      body: readString(row.body, `${path}[${index}].body`, issues, { max: MAX_LONG_TEXT }),
      tag: readString(row.tag, `${path}[${index}].tag`, issues, { max: MAX_SHORT_TEXT }),
    };
  });
}

function readArchLayers(value: unknown, path: string, issues: string[]): ArchLayer[] {
  if (!Array.isArray(value)) {
    pushIssue(issues, path, '배열이어야 합니다.');
    return [];
  }
  return value.map((item, index) => {
    const row = readObject(item, `${path}[${index}]`, issues);
    return {
      key: readString(row.key, `${path}[${index}].key`, issues, { max: MAX_SHORT_TEXT }),
      label: readString(row.label, `${path}[${index}].label`, issues, { max: MAX_SHORT_TEXT }),
      body: readString(row.body, `${path}[${index}].body`, issues, { max: MAX_LONG_TEXT }),
    };
  });
}

function readQaItems(value: unknown, path: string, issues: string[]): QaItem[] {
  if (!Array.isArray(value)) {
    pushIssue(issues, path, '배열이어야 합니다.');
    return [];
  }
  return value.map((item, index) => {
    const row = readObject(item, `${path}[${index}]`, issues);
    return {
      area: readString(row.area, `${path}[${index}].area`, issues, { max: MAX_SHORT_TEXT }),
      work: readString(row.work, `${path}[${index}].work`, issues, { max: MAX_LONG_TEXT }),
      done: readString(row.done, `${path}[${index}].done`, issues, { max: MAX_LONG_TEXT }),
    };
  });
}

function readTimelinePhases(value: unknown, path: string, issues: string[]): TimelinePhase[] {
  if (!Array.isArray(value)) {
    pushIssue(issues, path, '배열이어야 합니다.');
    return [];
  }
  return value.map((item, index) => {
    const row = readObject(item, `${path}[${index}]`, issues);
    return {
      label: readString(row.label, `${path}[${index}].label`, issues, { max: MAX_SHORT_TEXT }),
      span: readString(row.span, `${path}[${index}].span`, issues, { max: MAX_SHORT_TEXT }),
      start: readPositiveInteger(row.start, `${path}[${index}].start`, issues),
      end: readPositiveInteger(row.end, `${path}[${index}].end`, issues),
    };
  });
}

function readHandoffItems(value: unknown, path: string, issues: string[]): HandoffItem[] {
  if (!Array.isArray(value)) {
    pushIssue(issues, path, '배열이어야 합니다.');
    return [];
  }
  return value.map((item, index) => {
    const row = readObject(item, `${path}[${index}]`, issues);
    return {
      title: readString(row.title, `${path}[${index}].title`, issues, { max: MAX_SHORT_TEXT }),
      body: readString(row.body, `${path}[${index}].body`, issues, { max: MAX_LONG_TEXT }),
    };
  });
}

function readLayout(value: unknown, path: string, issues: string[]): SectionLayoutItem[] {
  if (!Array.isArray(value)) {
    pushIssue(issues, path, '배열이어야 합니다.');
    return [];
  }
  const seen = new Set<string>();
  const layout = value.map((item, index) => {
    const row = readObject(item, `${path}[${index}]`, issues);
    const id = readString(row.id, `${path}[${index}].id`, issues, { max: 40 }) as SectionId;
    if (id && !SECTION_SET.has(id)) pushIssue(issues, `${path}[${index}].id`, '알 수 없는 섹션입니다.');
    if (seen.has(id)) pushIssue(issues, `${path}[${index}].id`, '중복된 섹션입니다.');
    seen.add(id);
    return {
      id,
      visible: readBoolean(row.visible, `${path}[${index}].visible`, issues),
    };
  });
  for (const id of SECTION_ORDER) {
    if (!seen.has(id)) pushIssue(issues, path, `${id} 섹션이 누락되었습니다.`);
  }
  return layout;
}

export function validateProposalSectionsData(input: unknown): ProposalSectionsData {
  const issues: string[] = [];
  const root = readObject(input, 'sections', issues);

  const greeting = readObject(root.greeting, 'sections.greeting', issues);
  const about = readObject(root.about, 'sections.about', issues);
  const analysis = readObject(root.analysis, 'sections.analysis', issues);
  const strategy = readObject(root.strategy, 'sections.strategy', issues);
  const estimate = readObject(root.estimate, 'sections.estimate', issues);
  const portfolio = readObject(root.portfolio, 'sections.portfolio', issues);
  const architecture = readObject(root.architecture, 'sections.architecture', issues);
  const qa = readObject(root.qa, 'sections.qa', issues);
  const timeline = readObject(root.timeline, 'sections.timeline', issues);
  const warranty = readObject(root.warranty, 'sections.warranty', issues);
  const promise = readObject(root.promise, 'sections.promise', issues);

  const doc: ProposalSectionsData = {
    greeting: {
      title: readString(greeting.title, 'sections.greeting.title', issues, { max: MAX_TITLE }),
      intro: readString(greeting.intro, 'sections.greeting.intro', issues, { max: MAX_LONG_TEXT }),
      body: readString(greeting.body, 'sections.greeting.body', issues, { max: MAX_LONG_TEXT }),
    },
    about: {
      title: readString(about.title, 'sections.about.title', issues, { max: MAX_TITLE }),
      intro: readStringArray(about.intro, 'sections.about.intro', issues, { maxText: MAX_LONG_TEXT }),
      values: readAboutValues(about.values, 'sections.about.values', issues),
    },
    analysis: {
      title: readString(analysis.title, 'sections.analysis.title', issues, { max: MAX_TITLE }),
      content: readString(analysis.content, 'sections.analysis.content', issues, { max: MAX_LONG_TEXT }),
    },
    strategy: {
      title: readString(strategy.title, 'sections.strategy.title', issues, { max: MAX_TITLE }),
      items: readStrategyItems(strategy.items, 'sections.strategy.items', issues),
    },
    estimate: {
      title: readString(estimate.title, 'sections.estimate.title', issues, { max: MAX_TITLE }),
      cost: readString(estimate.cost, 'sections.estimate.cost', issues, { max: MAX_SHORT_TEXT }),
      costValue: readNullableNumber(estimate.costValue, 'sections.estimate.costValue', issues),
      period: readString(estimate.period, 'sections.estimate.period', issues, { max: MAX_SHORT_TEXT }),
      periodValue: readNullableNumber(estimate.periodValue, 'sections.estimate.periodValue', issues),
      warranty: readString(estimate.warranty, 'sections.estimate.warranty', issues, { max: MAX_SHORT_TEXT }),
      note: readString(estimate.note, 'sections.estimate.note', issues, { max: MAX_LONG_TEXT }),
    },
    portfolio: {
      title: readString(portfolio.title, 'sections.portfolio.title', issues, { max: MAX_TITLE }),
      description: readOptionalString(portfolio.description, 'sections.portfolio.description', issues, MAX_LONG_TEXT),
    },
    architecture: {
      title: readString(architecture.title, 'sections.architecture.title', issues, { max: MAX_TITLE }),
      note: readString(architecture.note, 'sections.architecture.note', issues, { max: MAX_LONG_TEXT }),
      layers: readArchLayers(architecture.layers, 'sections.architecture.layers', issues),
    },
    qa: {
      title: readString(qa.title, 'sections.qa.title', issues, { max: MAX_TITLE }),
      items: readQaItems(qa.items, 'sections.qa.items', issues),
    },
    timeline: {
      title: readString(timeline.title, 'sections.timeline.title', issues, { max: MAX_TITLE }),
      totalWeeks: readPositiveInteger(timeline.totalWeeks, 'sections.timeline.totalWeeks', issues),
      phases: readTimelinePhases(timeline.phases, 'sections.timeline.phases', issues),
    },
    warranty: {
      title: readString(warranty.title, 'sections.warranty.title', issues, { max: MAX_TITLE }),
      included: readStringArray(warranty.included, 'sections.warranty.included', issues, { maxText: MAX_LONG_TEXT }),
      excluded: readStringArray(warranty.excluded, 'sections.warranty.excluded', issues, { maxText: MAX_LONG_TEXT }),
      handoff: readHandoffItems(warranty.handoff, 'sections.warranty.handoff', issues),
    },
    promise: {
      title: readString(promise.title, 'sections.promise.title', issues, { max: MAX_TITLE }),
      body: readString(promise.body, 'sections.promise.body', issues, { max: MAX_LONG_TEXT }),
      commitments: readStringArray(promise.commitments, 'sections.promise.commitments', issues, { maxText: MAX_LONG_TEXT }),
    },
    layout: readLayout(root.layout, 'sections.layout', issues),
  };

  if (issues.length) throw new ProposalValidationError(issues);
  return doc;
}

export function validateCreateProposalInput(input: unknown): CreateProposalInput {
  const issues: string[] = [];
  const root = readObject(input, 'body', issues);
  const result: CreateProposalInput = {
    title: readString(root.title, 'body.title', issues, { max: MAX_TITLE, nonEmpty: true }).trim(),
    projectInfo: readProjectInfo(root.projectInfo, 'body.projectInfo', issues),
    rawProposalContent: readString(root.rawProposalContent, 'body.rawProposalContent', issues, {
      max: MAX_LONG_TEXT,
      nonEmpty: true,
    }),
    rawPortfolioContent: readOptionalString(root.rawPortfolioContent, 'body.rawPortfolioContent', issues, MAX_LONG_TEXT),
    portfolioSlugs:
      root.portfolioSlugs === undefined
        ? undefined
        : readStringArray(root.portfolioSlugs, 'body.portfolioSlugs', issues, { maxItems: MAX_LIST_ITEMS }),
  };

  if (issues.length) throw new ProposalValidationError(issues);
  return result;
}

export function validateUpdateProposalInput(input: unknown): UpdateProposalInput {
  const issues: string[] = [];
  const root = readObject(input, 'body', issues);
  const result: UpdateProposalInput = {};

  if ('title' in root) {
    result.title = readString(root.title, 'body.title', issues, { max: MAX_TITLE, nonEmpty: true }).trim();
  }
  if ('projectInfo' in root) {
    result.projectInfo = readProjectInfo(root.projectInfo, 'body.projectInfo', issues);
  }
  if ('sections' in root) {
    result.sections = validateProposalSectionsData(root.sections);
  }
  if ('portfolioSlugs' in root) {
    result.portfolioSlugs = readStringArray(root.portfolioSlugs, 'body.portfolioSlugs', issues, {
      maxItems: MAX_LIST_ITEMS,
    });
  }

  if (issues.length) throw new ProposalValidationError(issues);
  return result;
}

/* ────────────────────────────────────────────────────────────
 * 기본 콘텐츠 (파서/정규화 공용 시드)
 * NOTE: 기본값에는 회사명·연락처·개인명·고객사명 등 식별 정보를 포함하지 않는다.
 * ──────────────────────────────────────────────────────────── */
export const DEFAULT_ABOUT_INTRO: string[] = [
  '프로젝트 초기 기획부터 UX 설계, 디자인, 프론트엔드·백엔드 개발, 운영 고도화까지 하나의 흐름으로 수행하는 제품 개발 팀입니다.',
  '사용자 화면과 운영자 시스템을 함께 설계해, 출시 이후에도 관리하기 쉽고 확장 가능한 서비스를 만드는 데 집중합니다.',
  '단순 화면 제작이 아니라 요구사항, 데이터 구조, 운영 절차, QA 기준까지 함께 정리하는 실행 파트너를 지향합니다.',
];

export const DEFAULT_ABOUT_VALUES: AboutValue[] = [
  {
    title: '경험과 신뢰',
    body: '실제 운영 상황에서 발생하는 사용자 피드백, 관리자 업무, 예외 상황을 고려해 서비스 구조를 설계합니다.',
  },
  {
    title: '확장성과 유연함',
    body: '정책과 기능이 바뀌어도 데이터 구조와 화면 흐름을 무리 없이 확장할 수 있도록 공통 영역과 커스텀 영역을 분리합니다.',
  },
  {
    title: '장기적 안정성',
    body: '개발 완료 이후의 운영, QA, 인수인계까지 고려해 프로젝트가 안정적으로 이어지도록 기준을 남깁니다.',
  },
];

export const DEFAULT_STRATEGY: StrategyItem[] = [
  { index: '01', title: '요구사항과 성공 기준 확정', body: '핵심 화면과 데이터 구조, 완료 기준을 착수 초기 협의에서 정리해 이후 수정 비용을 줄입니다.', tag: '데이터 구조와 범위 기준 고정' },
  { index: '02', title: '공통 영역과 커스텀 범위 분리', body: '재사용 가능한 공통 컴포넌트와 프로젝트별 커스텀 구현 영역을 분리해 개발 효율을 높입니다.', tag: '필요한 범위를 빠뜨리지 않음' },
  { index: '03', title: '핵심 사용자 흐름 우선 구현', body: '탐색·구매·확인처럼 전환에 직접 연결되는 흐름을 우선 구현하고 점진적으로 확장합니다.', tag: '전환에 직접 닿는 화면 우선' },
  { index: '04', title: '중간 빌드와 운영 전달', body: '주차별 빌드와 QA로 진행 상황을 함께 확인하고, 배포·운영 가이드까지 검수합니다.', tag: '일정 리스크를 조기 확인' },
];

export const DEFAULT_ARCH_NOTE =
  '핵심 구현 영역과 연동 영역을 분리하되, 운영 데이터는 하나의 기준으로 관리합니다.';

export const DEFAULT_ARCH_LAYERS: ArchLayer[] = [
  { key: 'FRONT-END', label: '사용자·운영 화면', body: '탐색·구매·마이페이지와 운영 관리 화면을 역할별로 구성하고 PC·모바일 대응 범위를 확정합니다.' },
  { key: 'CORE', label: '업무 규칙·권한', body: '핵심 도메인 규칙, 역할별 권한, 데이터 수집·처리 로직을 관리합니다.' },
  { key: 'DATA', label: '데이터·백업', body: '주요 운영 데이터를 연결하고 이관·백업 기준을 관리합니다.' },
  { key: 'OPERATIONS', label: '알림·배포·운영', body: '알림·메일, 배포, 교육, 인수인계까지 운영 절차를 구성합니다.' },
];

export const DEFAULT_QA: QaItem[] = [
  { area: '핵심 데이터 관리', work: '주요 도메인 데이터 구조와 관리 화면을 구성', done: '항목 간 연결 관계와 필수 흐름 확인' },
  { area: '사용자 흐름', work: '탐색·상세·구매·확인 흐름을 실제 시나리오로 점검', done: '이탈 지점과 예외 처리 흐름 확인' },
  { area: '외부 연동', work: '결제·인증 등 외부 연동의 응답과 예외 처리를 구성', done: '연동 조건 확인 후 처리 기준 확정' },
  { area: '권한·대시보드', work: '역할별 화면과 접근 범위를 구성', done: '역할별 화면과 접근 범위 확인' },
  { area: '운영 전달', work: '이관·백업, QA, 배포, 교육, 인수인계 범위를 진행', done: '이관·운영 가이드와 전달 산출물 확인' },
];

export const DEFAULT_WARRANTY_INCLUDED: string[] = ['개발 범위 내 검수 이슈 확인', '배포 후 초기 안정화 확인'];
export const DEFAULT_WARRANTY_EXCLUDED: string[] = ['신규 기능과 정산 정책 변경', '외부 서비스와 데이터 정제'];
export const DEFAULT_WARRANTY_HANDOFF: HandoffItem[] = [
  { title: '소스·환경·운영 가이드', body: '개발 결과물, 실행·배포 방법, 주요 설정값과 운영 가이드를 정리해 전달합니다.' },
  { title: '계정·권한과 후속 대응 기준', body: '제공 가능한 계정·권한 전달 범위는 확인 후 확정하고, 후속 고도화는 별도 협의합니다.' },
];

/** 총 주차에 맞춰 5단계 표준 일정을 생성 */
export function buildDefaultTimeline(totalWeeks: number): TimelinePhase[] {
  const weeks = Math.max(5, totalWeeks || 9);
  const spans = [
    { label: '요구사항·범위 확정', ratio: 0.2 },
    { label: '구조·연동 설계', ratio: 0.12 },
    { label: '핵심 기능 구현', ratio: 0.36 },
    { label: '부가·운영 기능 구현', ratio: 0.16 },
    { label: '통합 QA·배포·인수', ratio: 0.16 },
  ];
  const phases: TimelinePhase[] = [];
  let cursor = 1;
  spans.forEach((s, i) => {
    const len = i === spans.length - 1 ? weeks - cursor + 1 : Math.max(1, Math.round(weeks * s.ratio));
    const start = cursor;
    const end = Math.min(weeks, cursor + len - 1);
    phases.push({ label: s.label, span: start === end ? `W${start}` : `W${start}-W${end}`, start, end });
    cursor = end + 1;
  });
  return phases;
}

/** 완전한 기본 문서 */
export function createDefaultDoc(): ProposalSectionsData {
  return {
    greeting: { title: DEFAULT_TITLES.greeting, intro: DEFAULT_GREETING_INTRO, body: '' },
    about: { title: DEFAULT_TITLES.about, intro: DEFAULT_ABOUT_INTRO, values: DEFAULT_ABOUT_VALUES },
    analysis: { title: DEFAULT_TITLES.analysis, content: '' },
    strategy: { title: DEFAULT_TITLES.strategy, items: DEFAULT_STRATEGY },
    estimate: {
      title: DEFAULT_TITLES.estimate,
      cost: '',
      costValue: null,
      period: '',
      periodValue: null,
      warranty: '',
      note: '',
    },
    portfolio: { title: DEFAULT_TITLES.portfolio, description: '' },
    architecture: { title: DEFAULT_TITLES.architecture, note: DEFAULT_ARCH_NOTE, layers: DEFAULT_ARCH_LAYERS },
    qa: { title: DEFAULT_TITLES.qa, items: DEFAULT_QA },
    timeline: { title: DEFAULT_TITLES.timeline, totalWeeks: 9, phases: buildDefaultTimeline(9) },
    warranty: {
      title: DEFAULT_TITLES.warranty,
      included: DEFAULT_WARRANTY_INCLUDED,
      excluded: DEFAULT_WARRANTY_EXCLUDED,
      handoff: DEFAULT_WARRANTY_HANDOFF,
    },
    promise: { title: DEFAULT_TITLES.promise, body: '', commitments: [] },
    layout: defaultLayout(),
  };
}

/** 레거시 분석 블록(lead + ContentBlock[])을 마크다운 문자열로 변환한다(하위 호환용). */
export function blocksToMarkdown(lead: string, blocks: ContentBlock[]): string {
  const parts: string[] = [];
  if (lead?.trim()) parts.push(lead.trim());
  for (const b of blocks ?? []) {
    if (b.kind === 'heading' && b.text?.trim()) parts.push(`## ${b.text.trim()}`);
    else if (b.kind === 'feature' && (b.title?.trim() || b.body?.trim()))
      parts.push(`### ${(b.title ?? '').trim()}${b.body?.trim() ? `\n\n${b.body.trim()}` : ''}`);
    else if (b.kind === 'list' && b.items?.length)
      parts.push(b.items.filter((it) => it?.trim()).map((it) => `- ${it.trim()}`).join('\n'));
    else if (b.kind === 'paragraph' && b.text?.trim()) parts.push(b.text.trim());
  }
  return parts.join('\n\n');
}

/** analysis 섹션 정규화: 신규 {content}는 그대로, 레거시 {lead, blocks}는 마크다운으로 변환. */
function normalizeAnalysis(input: unknown): { title: string; content: string } {
  const def = createDefaultDoc().analysis;
  if (!input || typeof input !== 'object') return def;
  const a = input as Record<string, unknown>;
  const title = typeof a.title === 'string' && a.title.trim() ? a.title : def.title;
  if (typeof a.content === 'string') return { title, content: a.content };
  const lead = typeof a.lead === 'string' ? a.lead : '';
  const blocks = Array.isArray(a.blocks) ? (a.blocks as ContentBlock[]) : [];
  return { title, content: lead || blocks.length ? blocksToMarkdown(lead, blocks) : '' };
}

/**
 * 부분/구버전 sections를 완전한 문서로 정규화한다.
 * 구버전(고정 섹션·title·layout 없음)도 안전하게 렌더/편집되도록 결측 필드를 기본값으로 채운다.
 */
export function normalizeDoc(
  input: Partial<ProposalSectionsData> | null | undefined,
): ProposalSectionsData {
  const d = createDefaultDoc();
  if (!input || typeof input !== 'object') return d;
  const i = input as Record<string, unknown>;
  const merge = <K extends keyof ProposalSectionsData>(key: K): ProposalSectionsData[K] => {
    const v = i[key as string];
    return v && typeof v === 'object' && !Array.isArray(v)
      ? ({ ...(d[key] as object), ...(v as object) } as ProposalSectionsData[K])
      : d[key];
  };
  return {
    greeting: merge('greeting'),
    about: merge('about'),
    analysis: normalizeAnalysis(i.analysis),
    strategy: merge('strategy'),
    estimate: merge('estimate'),
    portfolio: merge('portfolio'),
    architecture: merge('architecture'),
    qa: merge('qa'),
    timeline: merge('timeline'),
    warranty: merge('warranty'),
    promise: merge('promise'),
    layout: Array.isArray(i.layout) && (i.layout as unknown[]).length
      ? (i.layout as SectionLayoutItem[])
      : d.layout,
  };
}
