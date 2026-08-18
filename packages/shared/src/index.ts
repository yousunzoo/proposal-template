/**
 * 제안서 템플릿 공유 타입.
 * web(Next.js)와 api(Nest.js)가 함께 사용하는 DTO·섹션 모델을 정의한다.
 *
 * v2: 모든 섹션 콘텐츠를 제안서별 데이터로 보유(고정 섹션 포함) + 섹션 title + layout(순서/표시).
 */

/* ────────────────────────────────────────────────────────────
 * 콘텐츠 블록 (clickb PortfolioDetail.parseContent 패턴 재사용)
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

export interface TeamMemberEntry {
  name: string;
  en: string;
}

export interface TeamGroupEntry {
  dept: string;
  members: TeamMemberEntry[];
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
  | 'team'
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
  'team',
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
  team: '팀 소개',
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
  team: '전원 정규직 전문 인력으로 구성된 팀입니다',
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

/* ────────────────────────────────────────────────────────────
 * 제안서 문서 (DB sections Json 컬럼에 저장)
 * ──────────────────────────────────────────────────────────── */
export interface ProposalSectionsData {
  greeting: { body: string };
  about: { title: string; intro: string[]; values: AboutValue[] };
  team: { title: string; intro: string; groups: TeamGroupEntry[]; bullets: string[] };
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
 * 기본 콘텐츠 (파서/정규화 공용 시드)
 * NOTE: 발주 플랫폼 제약상 회사명·연락처 등 신원 정보는 포함하지 않는다.
 * ──────────────────────────────────────────────────────────── */
export const DEFAULT_ABOUT_INTRO: string[] = [
  "저희는 2021년 법인 설립 이후, 5억 원 규모의 부동산 대출 중개·매칭 플랫폼 '뱅크몰'을 자사 서비스(누적 사용자 800만 명, 월 방문자 10만 명 규모)로 직접 기획·개발하며 서비스를 시작했습니다.",
  '서비스 초기 기획 단계부터 UX 설계, 디자인, 프론트엔드·백엔드 개발, 운영 및 고도화까지 전 과정을 내부 인력으로 수행해왔으며, 이를 통해 실사용자 중심의 서비스 운영 경험과 기술적 완성도를 동시에 축적해왔습니다.',
  '현재는 다양한 플랫폼 및 IT 프로젝트를 계약·수행하고 있으며, 단순 개발사가 아닌 서비스 성장까지 함께 설계하는 파트너로 자리하고 있습니다.',
];

export const DEFAULT_ABOUT_VALUES: AboutValue[] = [
  {
    title: '경험과 신뢰',
    body: '2022년부터 자사 서비스를 운영하며 실제 사용자의 피드백을 반영해 더 나은 사용자 경험(UX)을 제공해왔습니다. 실제 경험을 바탕으로 고객의 신뢰를 얻고 비즈니스 성과를 창출할 수 있도록 돕습니다.',
  },
  {
    title: '확장성과 유연함',
    body: '200여 개 금융사와의 제휴를 확장하는 과정에서 각 금융 상품의 특성에 맞춘 새로운 기능을 개발하며 신속하고 유연하게 대응해왔습니다. 쉽게 관리하고, 확장 가능한 시스템을 설계합니다.',
  },
  {
    title: '장기적 안정성',
    body: '저희 역시 외주 개발의 아쉬움을 경험한 뒤 실력 있는 개발팀을 직접 구축했습니다. 전문성 있는 인력이 장기적으로 안정적인 최고의 결과물을 만듭니다.',
  },
];

export const DEFAULT_TEAM_INTRO =
  'PM, 기획, 개발, 디자인 각 분야의 전문성을 갖춘 팀원(전원 정규직)들이 명확한 역할 분담과 체계적인 협업 프로세스를 바탕으로 프로젝트를 수행합니다.';

export const DEFAULT_TEAM_GROUPS: TeamGroupEntry[] = [
  {
    dept: 'PM / 기획',
    members: [
      { name: '박상우', en: 'PARK SANG-WOO' },
      { name: '김단중', en: 'KIM DAN-JUNG' },
      { name: '김나연', en: 'KIM NA-YEON' },
    ],
  },
  { dept: '디자인', members: [{ name: '김다은', en: 'KIM DA-EUN' }] },
  {
    dept: '개발 (Front-End)',
    members: [
      { name: '황재영', en: 'HWANG JAE-YOUNG' },
      { name: '유선주', en: 'YU SUN-JOO' },
    ],
  },
  {
    dept: '개발 (Back-End)',
    members: [
      { name: '최민규', en: 'CHOI MIN-KYU' },
      { name: '최우석', en: 'CHOI WOO-SEOK' },
    ],
  },
];

export const DEFAULT_TEAM_BULLETS: string[] = [
  '기획, 디자인, 프론트엔드, 백엔드 등 각 분야의 전문 인력으로 구성된 통합 팀',
  '자사 서비스의 기획부터 개발, 운영·고도화까지 전 과정을 직접 수행',
  '설립 초기부터 함께해온 팀으로 다수의 프로젝트를 안정적으로 완수',
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
    greeting: { body: '' },
    about: { title: DEFAULT_TITLES.about, intro: DEFAULT_ABOUT_INTRO, values: DEFAULT_ABOUT_VALUES },
    team: {
      title: DEFAULT_TITLES.team,
      intro: DEFAULT_TEAM_INTRO,
      groups: DEFAULT_TEAM_GROUPS,
      bullets: DEFAULT_TEAM_BULLETS,
    },
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
    team: merge('team'),
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
