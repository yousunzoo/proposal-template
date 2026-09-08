import type {
  CreateProposalInput,
  ProposalDto,
  PublishResult,
  UpdateProposalInput,
} from '@proposal/shared';

/**
 * 브라우저용 제안서 API 클라이언트.
 * 모든 호출은 동일 출처 Next route handler(/api/proposals)로 나간다(인증 없음).
 * 서버 컴포넌트(SSR)는 이 클라이언트 대신 @/server/proposal/service 를 직접 호출한다.
 */

const BASE = '/api/proposals';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `요청 실패 (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    } catch {
      /* noop */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  list: () => request<ProposalDto[]>(''),

  create: (input: CreateProposalInput) =>
    request<ProposalDto>('', { method: 'POST', body: JSON.stringify(input) }),

  get: (id: string) => request<ProposalDto>(`/${id}`),

  generate: (id: string) => request<ProposalDto>(`/${id}/generate`, { method: 'POST' }),

  update: (id: string, input: UpdateProposalInput) =>
    request<ProposalDto>(`/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),

  publish: (id: string) => request<PublishResult>(`/${id}/publish`, { method: 'POST' }),

  unpublish: (id: string) => request<ProposalDto>(`/${id}/unpublish`, { method: 'POST' }),

  remove: (id: string) => request<void>(`/${id}`, { method: 'DELETE' }),

  getPublic: (slug: string) => request<ProposalDto>(`/public/${slug}`),
};
