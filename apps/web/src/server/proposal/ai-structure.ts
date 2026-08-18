import OpenAI from 'openai';
import type { ContentBlock } from '@proposal/shared';
import { parseAmount, parsePeriodDays, type DerivedParts } from './parser';

/**
 * 제안서 원문을 LLM(OpenAI)으로 구조화(structure-only)한다.
 * 문장은 최대한 원문 그대로 보존하고 섹션/블록/견적 값만 추출한다.
 * API 키가 없거나 실패하면 null을 반환 → 호출부가 결정론 파서로 폴백.
 */

interface RawStructured {
  greeting: string;
  analysisLead: string;
  analysisBlocks: {
    type: 'heading' | 'feature' | 'paragraph' | 'list';
    text: string;
    title: string;
    body: string;
    items: string[];
  }[];
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
    analysisLead: { type: 'string' },
    analysisBlocks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          type: { type: 'string', enum: ['heading', 'feature', 'paragraph', 'list'] },
          text: { type: 'string' },
          title: { type: 'string' },
          body: { type: 'string' },
          items: { type: 'array', items: { type: 'string' } },
        },
        required: ['type', 'text', 'title', 'body', 'items'],
      },
    },
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
    'analysisLead',
    'analysisBlocks',
    'estimate',
    'promiseBody',
    'commitments',
    'portfolioDescription',
  ],
};

const SYSTEM_PROMPT = `당신은 SI 제안서 원문을 구조화하는 도구다. 형식이 제각각인 제안서 원문(마커, 번호, 자유 서술 등)을 받아 정해진 JSON 스키마로 변환한다.

원칙:
- 구조화만 한다. 문장을 새로 쓰거나 요약·윤색하지 말고 원문 표현을 최대한 그대로 보존한다.
- 없는 내용을 지어내지 않는다. 해당 섹션이 원문에 없으면 빈 문자열/빈 배열을 반환한다.
- 한국어를 유지한다.

각 필드:
- greeting: 인사말/도입부 본문. 문단은 빈 줄 2개(\\n\\n)로 구분.
- analysisLead: 프로젝트 분석의 도입 문장 1개(있으면).
- analysisBlocks: 분석 본문을 순서대로 블록화.
  - heading: 소제목(예: [담당 업무], "가. 데이터 마이그레이션", "1) 사용자 관점"). text에 제목만.
  - feature: "N. 제목" 형태의 번호형 핵심 항목. title에 제목, body에 이어지는 설명.
  - list: 불릿 목록. items에 각 항목(기호 제외).
  - paragraph: 일반 문단. text에 문단.
  - 사용하지 않는 필드는 빈 문자열/빈 배열로 채운다.
- estimate.cost/period/warranty: 원문 표기 그대로의 표시 문자열(예: "3,000만 원", "약 10주 ~ 13주", "3개월"). 없으면 "".
- estimate.note: 견적 관련 비고/단서 문장(※ 또는 마무리 서술). 없으면 "".
- promiseBody: '성공을 향한 약속' 본문에서 첫째/둘째/셋째 다짐 줄을 제외한 서술. 문단은 \\n\\n 구분.
- commitments: 첫째/둘째/셋째 등 다짐의 핵심 한 문장씩(접두어 제외).
- portfolioDescription: '유사/관련 포트폴리오' 자유 서술(있으면). [소제목] 구조는 보존.`;

function aiAvailable(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/** 원문 → DerivedParts. 실패/키없음이면 null. */
export async function structure(raw: string, portfolioText?: string): Promise<DerivedParts | null> {
  if (!aiAvailable()) return null;
  if (!raw?.trim()) return null;

  try {
    const client = new OpenAI();
    const model = process.env.OPENAI_MODEL ?? 'gpt-5';
    const userContent =
      `제안서 원문:\n"""\n${raw}\n"""` +
      (portfolioText?.trim()
        ? `\n\n관련 포트폴리오 원문(있으면 portfolioDescription에 반영):\n"""\n${portfolioText}\n"""`
        : '');

    const res = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'proposal', strict: true, schema: OUTPUT_SCHEMA },
      },
    });

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
  let featureCount = 0;
  const blocks: ContentBlock[] = [];
  for (const b of d.analysisBlocks ?? []) {
    if (b.type === 'heading' && b.text?.trim()) {
      blocks.push({ kind: 'heading', text: b.text.trim() });
    } else if (b.type === 'feature' && (b.title?.trim() || b.body?.trim())) {
      featureCount += 1;
      blocks.push({
        kind: 'feature',
        index: String(featureCount).padStart(2, '0'),
        title: (b.title || '').trim(),
        body: (b.body || '').trim(),
      });
    } else if (b.type === 'list' && b.items?.length) {
      blocks.push({ kind: 'list', items: b.items.map((i) => i.trim()).filter(Boolean) });
    } else if (b.type === 'paragraph' && b.text?.trim()) {
      blocks.push({ kind: 'paragraph', text: b.text.trim() });
    }
  }

  const cost = (d.estimate?.cost ?? '').trim();
  const period = (d.estimate?.period ?? '').trim();

  return {
    greetingBody: (d.greeting ?? '').trim(),
    analysisLead: (d.analysisLead ?? '').trim(),
    analysisBlocks: blocks,
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
