import OpenAI from 'openai';
import { parseAmount, parsePeriodDays, type DerivedParts } from './parser';
import { getPromptContent, STRUCTURE_PROMPT_KEY } from './prompt';

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
    // 시스템 프롬프트는 어드민(/prompts)에서 편집 가능. 없으면 코드 기본값으로 폴백.
    const systemPrompt = await getPromptContent(STRUCTURE_PROMPT_KEY);
    const userContent =
      `제안서 원문:\n"""\n${raw}\n"""` +
      (portfolioText?.trim()
        ? `\n\n관련 포트폴리오 원문(있으면 portfolioDescription에 반영):\n"""\n${portfolioText}\n"""`
        : '');

    const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
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
