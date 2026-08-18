'use client';

import { use, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type {
  ProjectInfo,
  ProposalDto,
  ProposalSectionsData,
  SectionId,
} from '@proposal/shared';
import { SECTION_LABELS, SECTION_ORDER, normalizeDoc } from '@proposal/shared';
import { api } from '@/lib/api';
import { Button } from '@/components/ui';
import { ProposalBody } from '@/components/proposal/ProposalBody';
import { cn } from '@/lib/cn';
import { assignKeys, stripKeys } from './_lib/keys';
import { Toolbar, type SaveStatus } from './_components/Toolbar';
import { SectionRail } from './_components/SectionRail';
import { SectionEditor, ProjectInfoEditor } from './_components/section-editors';
import { Eye, EyeOff, ExternalLink } from './_components/icons';

type Doc = ProposalSectionsData;

function isSectionId(key: string): key is SectionId {
  return (SECTION_ORDER as string[]).includes(key);
}

export default function EditProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [proposal, setProposal] = useState<ProposalDto | null>(null);
  const [title, setTitle] = useState('');
  const [info, setInfo] = useState<ProjectInfo>({});
  const [doc, setDoc] = useState<Doc | null>(null);
  const [portfolioSlugs, setPortfolioSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [activeKey, setActiveKey] = useState<string>('project');
  const [showPreview, setShowPreview] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    api
      .get(id)
      .then((p) => {
        setProposal(p);
        setTitle(p.title);
        setInfo(p.projectInfo ?? {});
        setDoc(p.sections ? assignKeys(normalizeDoc(p.sections)) : null);
        setPortfolioSlugs(p.portfolioSlugs);
        if (p.published && p.slug) setPublishedUrl(`${window.location.origin}/p/${p.slug}`);
      })
      .catch((e) => setError(e instanceof Error ? e.message : '불러오기 실패'))
      .finally(() => setLoading(false));
  }, [id]);

  /** doc 불변 업데이트 */
  function update(mutator: (d: Doc) => void) {
    setDoc((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      mutator(next);
      return next;
    });
  }

  async function persist() {
    if (!doc) return;
    setStatus('saving');
    setError(null);
    try {
      const updated = await api.update(id, {
        title,
        projectInfo: info,
        sections: stripKeys(doc),
        portfolioSlugs,
      });
      setProposal(updated);
      setSavedAt(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
      setStatus('saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패');
      setStatus('error');
    }
  }

  // 자동 저장 (디바운스). 최초 로드분은 건너뛴다.
  useEffect(() => {
    if (!doc) return;
    if (!loadedRef.current) {
      loadedRef.current = true;
      return;
    }
    setStatus('changed');
    const t = setTimeout(() => void persist(), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, info, doc, portfolioSlugs]);

  // ⌘/Ctrl+S 즉시 저장
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void persist();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, title, info, portfolioSlugs]);

  // 미저장 상태 이탈 경고
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (status === 'changed' || status === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [status]);

  // 프리뷰가 켜져 있으면 활성 섹션으로 스크롤
  useEffect(() => {
    if (!showPreview || !isSectionId(activeKey)) return;
    const el = previewRef.current?.querySelector(`#${CSS.escape(activeKey)}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeKey, showPreview]);

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    try {
      if (doc) {
        await api.update(id, { title, projectInfo: info, sections: stripKeys(doc), portfolioSlugs });
      }
      const result = await api.publish(id);
      setPublishedUrl(result.url);
      setSavedAt(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
      setStatus('saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : '배포 실패');
      setStatus('error');
    } finally {
      setPublishing(false);
    }
  }

  function togglePortfolio(slug: string) {
    setPortfolioSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  // 프리뷰에서 섹션 클릭 → 해당 편집으로 전환
  function handlePreviewClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const sec = target.closest('section[id]');
    if (sec?.id && isSectionId(sec.id)) setActiveKey(sec.id);
  }

  const activeVisible = useMemo(() => {
    if (!doc || !isSectionId(activeKey)) return null;
    return doc.layout.find((l) => l.id === activeKey)?.visible ?? true;
  }, [doc, activeKey]);

  const activeLabel =
    activeKey === 'project' ? '프로젝트 정보' : SECTION_LABELS[activeKey as SectionId] ?? activeKey;

  if (loading) {
    return <div className="mx-auto px-5 py-24 text-center text-ink-500">불러오는 중…</div>;
  }
  if (!proposal || !doc) {
    return (
      <div className="mx-auto px-5 py-24 text-center">
        <p className="text-ink-600">{error ?? '제안서를 찾을 수 없습니다.'}</p>
        <Link href="/" className="mt-4 inline-block text-blue-600">← 홈으로</Link>
      </div>
    );
  }

  const layout = doc.layout?.length ? doc.layout : SECTION_ORDER.map((sid) => ({ id: sid, visible: true }));

  return (
    <div className="flex h-screen flex-col bg-elevated">
      <Toolbar
        id={id}
        status={status}
        savedAt={savedAt}
        showPreview={showPreview}
        onTogglePreview={() => {
          // lg 이상은 사이드 프리뷰, 미만은 오버레이
          if (window.matchMedia('(min-width: 1024px)').matches) setShowPreview((v) => !v);
          else setMobilePreview(true);
        }}
        onPublish={handlePublish}
        publishing={publishing}
      />

      {/* 모바일 섹션 선택 바 */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-line bg-surface px-3 py-2 lg:hidden">
        <MobileChip label="프로젝트 정보" active={activeKey === 'project'} onClick={() => setActiveKey('project')} />
        {layout.map((l) => (
          <MobileChip
            key={l.id}
            label={SECTION_LABELS[l.id]}
            active={activeKey === l.id}
            dimmed={!l.visible}
            onClick={() => setActiveKey(l.id)}
          />
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* ═══ 좌: 섹션 네비 ═══ */}
        <aside className="hidden w-64 shrink-0 border-r border-line bg-surface py-3 lg:block">
          <SectionRail
            doc={doc}
            update={update}
            title={title}
            info={info}
            activeKey={activeKey}
            onSelect={setActiveKey}
          />
        </aside>

        {/* ═══ 중앙: 편집 캔버스 ═══ */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto px-5 py-6 sm:px-8">
            {publishedUrl && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
                <div>
                  <p className="text-[13px] font-semibold text-blue-700">발행 완료</p>
                  <a href={publishedUrl} target="_blank" className="text-sm text-blue-600 underline">
                    {publishedUrl}
                  </a>
                </div>
                <Link href={publishedUrl} target="_blank">
                  <Button size="sm" type="button">공개 페이지 열기</Button>
                </Link>
              </div>
            )}
            {error && (
              <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* 섹션 헤더 */}
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-line pb-4">
              <div className="flex items-center gap-2.5">
                <h1 className="text-[22px] font-bold tracking-[-0.01em] text-ink-900">{activeLabel}</h1>
                {activeVisible === false && (
                  <span className="rounded-full bg-elevated px-2 py-0.5 text-[11px] font-medium text-ink-500">
                    숨김 상태
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {activeVisible !== null && (
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() =>
                      update((d) => {
                        const it = d.layout.find((x) => x.id === activeKey);
                        if (it) it.visible = !it.visible;
                      })
                    }
                    title={activeVisible ? '이 섹션 숨기기' : '이 섹션 표시하기'}
                  >
                    {activeVisible ? <EyeOff width={15} height={15} /> : <Eye width={15} height={15} />}
                    {activeVisible ? '숨기기' : '표시하기'}
                  </Button>
                )}
              </div>
            </div>

            {/* 섹션 편집 폼 */}
            <div className="pb-24">
              {activeKey === 'project' ? (
                <ProjectInfoEditor title={title} setTitle={setTitle} info={info} setInfo={setInfo} />
              ) : (
                <SectionEditor
                  sectionKey={activeKey}
                  doc={doc}
                  update={update}
                  portfolioSlugs={portfolioSlugs}
                  togglePortfolio={togglePortfolio}
                />
              )}
            </div>
          </div>
        </main>

        {/* ═══ 우: 라이브 프리뷰 (토글) ═══ */}
        {showPreview && (
          <aside className="hidden w-[44%] shrink-0 border-l border-line bg-canvas lg:block">
            <div className="flex h-9 items-center justify-between border-b border-line bg-surface px-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
                라이브 미리보기
              </span>
              <Link
                href={`/proposals/${id}/preview`}
                target="_blank"
                className="flex items-center gap-1 text-[11px] text-ink-500 hover:text-blue-700"
              >
                <ExternalLink width={13} height={13} /> 새 탭
              </Link>
            </div>
            <div
              ref={previewRef}
              onClick={handlePreviewClick}
              className="h-[calc(100%-2.25rem)] cursor-pointer overflow-y-auto [&_a]:pointer-events-none [&_button]:pointer-events-none"
            >
              <ProposalBody doc={doc} title={title} info={info} portfolioSlugs={portfolioSlugs} itemBase="#" />
            </div>
          </aside>
        )}
      </div>

      {/* 모바일 프리뷰 오버레이 */}
      {mobilePreview && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-canvas lg:hidden">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/90 px-5 py-3 backdrop-blur-xl">
            <span className="text-sm font-semibold text-ink-900">미리보기</span>
            <Button variant="secondary" size="sm" type="button" onClick={() => setMobilePreview(false)}>
              닫기
            </Button>
          </div>
          <div className="[&_a]:pointer-events-none">
            <ProposalBody doc={doc} title={title} info={info} portfolioSlugs={portfolioSlugs} itemBase="#" />
          </div>
        </div>
      )}
    </div>
  );
}

function MobileChip({
  label,
  active,
  dimmed,
  onClick,
}: {
  label: string;
  active: boolean;
  dimmed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors',
        active
          ? 'border-blue-300 bg-blue-50 text-blue-700'
          : 'border-line bg-surface text-ink-500 hover:text-ink-900',
        dimmed && !active && 'opacity-40',
      )}
    >
      {label}
    </button>
  );
}
