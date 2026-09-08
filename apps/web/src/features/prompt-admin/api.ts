/** prompt-admin 기능의 브라우저 API 클라이언트 (/api/prompts) */

export interface PromptView {
  key: string;
  label: string;
  description: string;
  content: string;
  /** DB에 저장된 커스텀 값이 적용 중인지(false면 코드 기본값) */
  isCustom: boolean;
  updatedAt: string | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/prompts${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
  if (!res.ok) {
    let message = `요청 실패 (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* noop */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const promptApi = {
  list: () => request<PromptView[]>(''),
  /** content가 빈 문자열이면 서버가 커스텀 값을 지우고 기본값으로 되돌린다. */
  save: (key: string, content: string) =>
    request<PromptView>(`/${key}`, { method: 'PUT', body: JSON.stringify({ content }) }),
};
