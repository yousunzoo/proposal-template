import type { ProposalSectionsData } from '@proposal/shared';

/**
 * 리스트 항목 식별용 클라이언트 전용 키.
 *
 * `update()`가 매 편집마다 문서 전체를 structuredClone 하므로 객체 참조로는
 * 항목을 식별할 수 없다(참조가 매번 바뀜). 대신 항목 객체에 `_k` 문자열을
 * 심고, clone 이 이를 보존하도록 한다. 저장 직전 stripKeys 로 제거한다.
 */

export const KEY_FIELD = '_k' as const;

/** `_k`를 가질 수 있는 리스트 항목 */
export type Keyed<T> = T & { _k?: string };

let seq = 0;
export function genKey(): string {
  seq += 1;
  return `k${seq}`;
}

/** 새 리스트 항목 객체에 `_k`를 부여한다(factory 용). */
export function withKey<T extends object>(obj: T): T {
  return { ...obj, [KEY_FIELD]: genKey() } as T;
}

/** 값이 `_k`를 붙일 수 있는 평범한 객체인지 */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** 재귀적으로 모든 배열의 "객체 항목"에 `_k`를 (없을 때만) 주입한다. */
function walkAssign(node: unknown): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      if (isPlainObject(item) && typeof item[KEY_FIELD] !== 'string') {
        item[KEY_FIELD] = genKey();
      }
      walkAssign(item);
    }
    return;
  }
  if (isPlainObject(node)) {
    for (const value of Object.values(node)) walkAssign(value);
  }
}

/** 로드된 문서를 편집용으로 준비: 모든 객체 리스트 항목에 `_k` 부여. */
export function assignKeys(doc: ProposalSectionsData): ProposalSectionsData {
  const next = structuredClone(doc);
  walkAssign(next);
  return next;
}

/** 재귀적으로 `_k`를 제거한 clone 을 반환한다. */
function walkStrip(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(walkStrip);
  if (isPlainObject(node)) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === KEY_FIELD) continue;
      out[key] = walkStrip(value);
    }
    return out;
  }
  return node;
}

/** 저장 payload 용: `_k`를 제거한 순수 문서. */
export function stripKeys(doc: ProposalSectionsData): ProposalSectionsData {
  return walkStrip(doc) as ProposalSectionsData;
}

/** 리스트 항목의 안정 React key (객체는 `_k`, 그 외는 인덱스 폴백). */
export function keyOf(item: unknown, index: number): string {
  if (isPlainObject(item) && typeof item[KEY_FIELD] === 'string') {
    return item[KEY_FIELD] as string;
  }
  return `i${index}`;
}
