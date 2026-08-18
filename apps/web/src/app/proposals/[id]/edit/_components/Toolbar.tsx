'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';
import { ArrowLeft, ExternalLink, PanelRight, Sparkles } from './icons';

export type SaveStatus = 'idle' | 'changed' | 'saving' | 'saved' | 'error';

function StatusPill({ status, savedAt }: { status: SaveStatus; savedAt: string | null }) {
  if (status === 'idle') return null;
  const map: Record<Exclude<SaveStatus, 'idle'>, { text: string; cls: string; dot: string }> = {
    changed: { text: '변경됨', cls: 'text-amber-600', dot: 'bg-amber-500' },
    saving: { text: '저장 중…', cls: 'text-ink-500', dot: 'bg-ink-400 animate-pulse' },
    saved: { text: savedAt ? `저장됨 ${savedAt}` : '저장됨', cls: 'text-green-600', dot: 'bg-green-500' },
    error: { text: '저장 실패', cls: 'text-red-600', dot: 'bg-red-500' },
  };
  const s = map[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', s.cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.text}
    </span>
  );
}

export function Toolbar({
  id,
  status,
  savedAt,
  showPreview,
  onTogglePreview,
  onRegenerate,
  regenerating,
  onPublish,
  publishing,
}: {
  id: string;
  status: SaveStatus;
  savedAt: string | null;
  showPreview: boolean;
  onTogglePreview: () => void;
  onRegenerate: () => void;
  regenerating: boolean;
  onPublish: () => void;
  publishing: boolean;
}) {
  // AI 정제는 파괴적 → 2단계 확인
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handleRegenerate = () => {
    if (armed) {
      setArmed(false);
      if (timer.current) clearTimeout(timer.current);
      onRegenerate();
    } else {
      setArmed(true);
      timer.current = setTimeout(() => setArmed(false), 4000);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-900"
        >
          <ArrowLeft width={16} height={16} /> 홈
        </Link>
        <span className="hidden text-sm font-semibold text-ink-900 sm:inline">제안서 편집</span>
        <StatusPill status={status} savedAt={savedAt} />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={showPreview ? 'primary' : 'secondary'}
          size="sm"
          type="button"
          onClick={onTogglePreview}
          className="hidden lg:inline-flex"
          title="라이브 미리보기 토글"
        >
          <PanelRight width={15} height={15} /> 미리보기
        </Button>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={onTogglePreview}
          className="lg:hidden"
        >
          미리보기
        </Button>
        <Link href={`/proposals/${id}/preview`} target="_blank" className="hidden lg:block">
          <Button variant="secondary" size="sm" type="button" title="새 탭에서 전체 미리보기">
            <ExternalLink width={15} height={15} />
          </Button>
        </Link>
        <Button
          variant={armed ? 'primary' : 'secondary'}
          size="sm"
          type="button"
          onClick={handleRegenerate}
          disabled={regenerating}
          title="원문을 AI로 다시 구조화합니다. 현재 편집 내용은 초기화됩니다."
          className={cn(armed && 'bg-amber-500 hover:bg-amber-600')}
        >
          <Sparkles width={15} height={15} />
          {regenerating ? 'AI 정제 중…' : armed ? '정말? 편집 내용 초기화' : 'AI 정제'}
        </Button>
        <Button size="sm" onClick={onPublish} disabled={publishing} type="button">
          {publishing ? '배포 중…' : '배포'}
        </Button>
      </div>
    </header>
  );
}
