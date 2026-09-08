'use client';

import { useEffect, useState } from 'react';
import { Button, Card, TextArea } from '@/shared/ui';
import { promptApi, type PromptView } from '../api';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function PromptCard({ initial }: { initial: PromptView }) {
  const [content, setContent] = useState(initial.content);
  const [meta, setMeta] = useState<PromptView>(initial);
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);

  const dirty = content !== meta.content;

  async function persist(next: string) {
    setState('saving');
    setError(null);
    try {
      const saved = await promptApi.save(meta.key, next);
      setMeta(saved);
      setContent(saved.content);
      setState('saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.');
      setState('error');
    }
  }

  return (
    <Card className="p-6 lg:p-7">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lead text-ink-900">{meta.label}</h2>
          <p className="mt-1 text-meta text-ink-500">{meta.description}</p>
        </div>
        <span
          className={
            meta.isCustom
              ? 'shrink-0 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-caption text-blue-700'
              : 'shrink-0 rounded-md border border-line bg-elevated px-2.5 py-1 text-caption text-ink-500'
          }
        >
          {meta.isCustom ? '커스텀 적용 중' : '기본값 사용 중'}
        </span>
      </div>

      <TextArea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setState('idle');
        }}
        className="mt-4 h-[420px] font-mono leading-[1.7]"
        spellCheck={false}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" onClick={() => persist(content)} disabled={!dirty || state === 'saving'}>
          {state === 'saving' ? '저장 중…' : '저장'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => persist('')}
          disabled={!meta.isCustom || state === 'saving'}
          title="저장된 커스텀 값을 지우고 코드 기본값으로 되돌립니다."
        >
          기본값으로 초기화
        </Button>
        {state === 'saved' && !dirty && <span className="text-meta text-green-600">저장됨</span>}
        {error && <span className="text-meta text-red-600">{error}</span>}
        {meta.updatedAt && (
          <span className="text-caption text-ink-400">
            최종 수정 {new Date(meta.updatedAt).toLocaleString('ko-KR')}
          </span>
        )}
      </div>
    </Card>
  );
}

export function PromptManager() {
  const [prompts, setPrompts] = useState<PromptView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    promptApi
      .list()
      .then(setPrompts)
      .catch((e) => setError(e instanceof Error ? e.message : '불러오지 못했습니다.'));
  }, []);

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-body-sm text-red-600">{error}</p>
    );
  }
  if (!prompts) {
    return <p className="text-body-sm text-ink-500">불러오는 중…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {prompts.map((p) => (
        <PromptCard key={p.key} initial={p} />
      ))}
    </div>
  );
}
