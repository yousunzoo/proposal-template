import OpenAI from 'openai';
import { parseAmount, parsePeriodDays, type DerivedParts } from './parser';

/**
 * 제안서 원문을 LLM(OpenAI)으로 구조화(structure-only)한다.
 * 문장은 최대한 원문 그대로 보존하고 섹션/견적 값만 추출한다.
 * 프로젝트 분석은 rigid 블록이 아닌 마크다운 문서로 출력한다(LLM이 안정적으로 다룸).
 * API 키가 없거나 실패하면 null을 반환 → 호출부가 결정론 파서로 폴백.
 */

interface RawStructured {
  greeting: string;
  analysisMarkdown: string;
  estimate: { cost: string; period: string; warranty: string; note: string };
  promiseBody: string;
  commitments: string[];
  portfolioDescription: string;
}

/** OpenAI strict json_schema: 모든 property가 required + additionalProperties:false */
const OUTPUT_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    greeting: { type: 'string' },
    analysisMarkdown: { type: 'string' },
    estimate: {
      type: 'object',
      additionalProperties: false,
      properties: {
        cost: { type: 'string' },
        period: { type: 'string' },
        warranty: { type: 'string' },
        note: { type: 'string' },
      },
      required: ['cost', 'period', 'warranty', 'note'],
    },
    promiseBody: { type: 'string' },
    commitments: { type: 'array', items: { type: 'string' } },
    portfolioDescription: { type: 'string' },
  },
  required: [
    'greeting',
    'analysisMarkdown',
    'estimate',
    'promiseBody',
    'commitments',
    'portfolioDescription',
  ],
};

const SYSTEM_PROMPT = `당신은 SI 제안서 원문을 구조화하고 문장을 가볍게 다듬는 도구다. 형식이 제각각인 제안서 원문(마커, 번호, 자유 서술 등)을 받아 정해진 JSON 스키마로 변환하면서, 어색한 표현만 자연스러운 제안서 문장으로 정리한다.

원칙(위에서부터 우선):
- [사실 고정 · 최우선] 사실·수치·금액·기간·고유명사·기술스택·범위·의미는 절대 바꾸거나 지어내지 않는다. 없는 내용을 추가하지 않는다.
- [무손실] 원문의 모든 실질 내용을 누락 없이 담는다. 요약·압축·생략은 금지다. 분류가 애매한 문장도 버리지 말고 가장 가까운 위치(대개 analysisMarkdown의 문단)에 담는다.
- [가벼운 윤문 — 산문 섹션 한정] greeting, promiseBody, commitments, portfolioDescription 같은 서술형 산문에서만, 위 두 원칙을 지키며 어색한 표현·번역투·중복·비문만 매끄러운 제안서 문어체로 다듬는다. 정보를 더하거나 빼지 않고, 이미 자연스러우면 그대로 둔다.
- [분석은 원문 보존 · 무손실 최우선] analysisMarkdown은 프로젝트 분석 원문을 "한 문장도 빠짐없이" 담는다. 원문의 모든 문장·문구·수치·항목·문단을 그대로 옮기고, 오직 마크다운 서식만 덧입힌다. 요약·축약·삭제·생략·문장 병합·의역은 절대 금지다. 원문 문단 수와 정보량이 그대로 유지되어야 한다. 출력 전, 원문의 각 문장이 analysisMarkdown에 존재하는지 스스로 대조한다.
- 해당 섹션이 원문에 없으면 빈 문자열/빈 배열을 반환한다.
- 한국어를 유지한다.

포맷팅 규칙(각 섹션 구조에 맞춰 정리):
- 공통: 불필요한 중복 공백·과도한 줄바꿈을 정리하고, 목록·제목·본문이 뒤섞인 원문을 각 섹션의 구조 단위로 정확히 분해한다.
- greeting: 의미 단위 문단으로 나누고 문단 사이는 빈 줄 2개(\\n\\n)로 구분한다.
- analysisMarkdown: 분석 원문을 그대로 보존하며 마크다운 서식만 입힌다. 원문의 소제목은 "## "/"### ", 번호·나열 항목은 "- "/"1. " 목록, 핵심어 강조는 **굵게**, 문단은 빈 줄로 구분. 문장 내용은 원문 그대로 둔다(삭제·요약 금지).
- (선택) mermaid 플로우차트: 원문이 절차·흐름·단계·데이터 관계·아키텍처를 서술하고 도식화가 이해를 도울 때에 한해, 원문 텍스트는 그대로 둔 채 그 아래 보조로 mermaid 다이어그램을 추가할 수 있다(텍스트를 대체하지 않는다). 형식은 \`\`\`mermaid 코드블록에 flowchart TD(또는 LR); 노드 라벨은 원문 용어를 쓴다. 흐름이 뚜렷하지 않으면 넣지 않는다.
- estimate: cost/period/warranty는 라벨(예 "비용:", "기간:")을 떼고 값 표기만 남긴다(수치·단위는 원문 그대로). note는 ※·단서 문장만.
- commitments: 각 다짐을 접두어(첫째/둘째/…) 없이 핵심 한 문장으로 분리한다. 나머지 서술은 promiseBody에 문단(\\n\\n)으로.
- portfolioDescription: [소제목] 구조와 문단 구분을 보존한다.

[분석 마크다운 예시] — 이 매핑을 정확히 따른다. 문장은 원문 그대로 두고 마크다운 서식만 입힌다.
입력:
"""
현행 시스템 노후화로 개편이 필요합니다.

[담당 업무]

1. 데이터 마이그레이션
기존 DB를 신규 스키마로 이관합니다.

2. 권한 관리
역할별 접근 제어를 구현합니다.

- 모바일 대응
- 관리자 대시보드
"""
출력(analysisMarkdown):
"""
현행 시스템 노후화로 개편이 필요합니다.

## 담당 업무

### 데이터 마이그레이션

기존 DB를 신규 스키마로 이관합니다.

### 권한 관리

역할별 접근 제어를 구현합니다.

- 모바일 대응
- 관리자 대시보드
"""

각 필드:
- greeting: 인사말/도입부 본문. 문단은 빈 줄 2개(\\n\\n)로 구분.
- analysisMarkdown: 프로젝트 분석 원문 전체를 무손실로 담은 마크다운. 원문의 모든 문장을 보존하고 서식만 입힌다. 필요 시 mermaid 플로우차트를 보조로 추가. 원문에 분석이 없으면 "".
  예) 절차가 서술되면 아래처럼 텍스트 뒤에 도식을 덧붙인다:
  \`\`\`mermaid
  flowchart LR
    A[광고주 검색] --> B[계약 전환] --> C[프로젝트 생성] --> D[정산]
  \`\`\`
- estimate.cost/period/warranty: 원문 표기 그대로의 표시 문자열(예: "3,000만 원", "약 10주 ~ 13주", "3개월"). 없으면 "".
- estimate.note: 견적 관련 비고/단서 문장(※ 또는 마무리 서술). 없으면 "".
- promiseBody: '성공을 향한 약속' 본문에서 첫째/둘째/셋째 다짐 줄을 제외한 서술. 문단은 \\n\\n 구분.
- commitments: 첫째/둘째/셋째 등 다짐의 핵심 한 문장씩(접두어 제외).
- portfolioDescription: '유사/관련 포트폴리오' 자유 서술(있으면). [소제목] 구조는 보존.`;

function aiAvailable(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/** reasoning_effort를 받는 추론 모델인지(gpt-5 계열·o-시리즈) */
function isReasoningModel(model: string): boolean {
  return /^(gpt-5|o[1345])/i.test(model);
}

/** 원문 → DerivedParts. 실패/키없음이면 null. */
export async function structure(raw: string, portfolioText?: string): Promise<DerivedParts | null> {
  if (!aiAvailable()) return null;
  if (!raw?.trim()) return null;

  try {
    const client = new OpenAI();
    const model = process.env.OPENAI_MODEL ?? 'gpt-5-mini';
    const userContent =
      `제안서 원문:\n"""\n${raw}\n"""` +
      (portfolioText?.trim()
        ? `\n\n관련 포트폴리오 원문(있으면 portfolioDescription에 반영):\n"""\n${portfolioText}\n"""`
        : '');

    const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'proposal', strict: true, schema: OUTPUT_SCHEMA },
      },
    };
    // 품질·속도 균형: 추론 모델은 'low'로. medium보다 빠르면서
    // 'minimal'처럼 내용을 누락시키지 않는 중간값.
    if (isReasoningModel(model)) {
      params.reasoning_effort = 'low';
    }

    const res = await client.chat.completions.create(params);

    const msg = res.choices[0]?.message;
    if (!msg || msg.refusal || !msg.content) return null;
    const data = JSON.parse(msg.content) as RawStructured;
    return toParts(data);
  } catch (e) {
    console.warn(`[ai] 구조화 실패, 결정론 파서로 폴백: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

function toParts(d: RawStructured): DerivedParts {
  const cost = (d.estimate?.cost ?? '').trim();
  const period = (d.estimate?.period ?? '').trim();

  return {
    greetingBody: (d.greeting ?? '').trim(),
    analysisMarkdown: (d.analysisMarkdown ?? '').trim(),
    estimate: {
      cost,
      costValue: parseAmount(cost),
      period,
      periodValue: parsePeriodDays(period),
      warranty: (d.estimate?.warranty ?? '').replace(/\s+/g, ''),
      note: (d.estimate?.note ?? '').trim(),
    },
    promiseBody: (d.promiseBody ?? '').trim(),
    commitments: (d.commitments ?? []).map((c) => c.trim()).filter(Boolean),
    portfolioDesc: (d.portfolioDescription ?? '').trim(),
  };
}
