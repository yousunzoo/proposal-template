'use client';

import { useRef } from 'react';
import type { ProjectInfo, ProposalSectionsData } from '@proposal/shared';
import { PROJECTS } from '@/entities/portfolio';
import { portfolioLabelText } from '@/lib/portfolio';
import { TextInput, TextArea } from '@/components/ui';
import { cn } from '@/lib/cn';
import { withKey } from '../_lib/keys';
import { Field, Sub, TitleField, RepeatList, LineListField } from './fields';

type Doc = ProposalSectionsData;
type Update = (mutator: (d: Doc) => void) => void;

export interface EditorProps {
  doc: Doc;
  update: Update;
}

/* ─────────── 프로젝트 정보 (메타) ─────────── */

export function ProjectInfoEditor({
  title,
  setTitle,
  info,
  setInfo,
}: {
  title: string;
  setTitle: (v: string) => void;
  info: ProjectInfo;
  setInfo: (fn: (v: ProjectInfo) => ProjectInfo) => void;
}) {
  return (
    <>
      <Field label="제안서 제목" hint="표지 헤드라인으로 사용됩니다.">
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="예산">
          <TextInput
            value={info.budget ?? ''}
            onChange={(e) => setInfo((v) => ({ ...v, budget: e.target.value }))}
          />
        </Field>
        <Field label="기간">
          <TextInput
            value={info.duration ?? ''}
            onChange={(e) => setInfo((v) => ({ ...v, duration: e.target.value }))}
          />
        </Field>
      </div>
      <Field label="기술 스택" className="mt-4">
        <TextInput
          value={info.skills ?? ''}
          onChange={(e) => setInfo((v) => ({ ...v, skills: e.target.value }))}
        />
      </Field>
    </>
  );
}

/* ─────────── 개별 섹션 편집 ─────────── */

function GreetingEditor({ doc, update }: EditorProps) {
  return (
    <Field label="본문" hint="첫 문단이 리드 문장으로 강조됩니다.">
      <TextArea
        value={doc.greeting.body}
        onChange={(e) => update((d) => { d.greeting.body = e.target.value; })}
        className="h-[200px]"
      />
    </Field>
  );
}

function AboutEditor({ doc, update }: EditorProps) {
  return (
    <>
      <TitleField value={doc.about.title} onChange={(v) => update((d) => { d.about.title = v; })} />
      <LineListField
        label="소개 문단"
        hint="한 줄에 한 문단씩 입력하세요. Enter로 문단을 나눕니다."
        value={doc.about.intro}
        onCommit={(n) => update((d) => { d.about.intro = n; })}
        placeholder={'자사 서비스를 직접 운영해온 개발사입니다.\n실사용자 피드백을 바탕으로 완성도를 높입니다.'}
        rows={5}
        className="mt-4"
      />
      <Sub label="핵심 가치">
        <RepeatList
          items={doc.about.values}
          onChange={(n) => update((d) => { d.about.values = n; })}
          factory={() => withKey({ title: '새 가치', body: '' })}
          addLabel="가치 추가"
          emptyHint="강조할 핵심 가치를 추가하세요."
          render={(_, i) => (
            <>
              <TextInput
                value={doc.about.values[i].title}
                onChange={(e) => update((d) => { d.about.values[i].title = e.target.value; })}
                placeholder="제목"
              />
              <TextArea
                value={doc.about.values[i].body}
                onChange={(e) => update((d) => { d.about.values[i].body = e.target.value; })}
                className="mt-2 h-[80px]"
                placeholder="설명"
              />
            </>
          )}
        />
      </Sub>
    </>
  );
}

function TeamEditor({ doc, update }: EditorProps) {
  return (
    <>
      <TitleField value={doc.team.title} onChange={(v) => update((d) => { d.team.title = v; })} />
      <Field label="팀 소개 문장" className="mt-4">
        <TextArea
          value={doc.team.intro}
          onChange={(e) => update((d) => { d.team.intro = e.target.value; })}
          className="h-[70px]"
        />
      </Field>
      <Sub label="팀 그룹">
        <RepeatList
          items={doc.team.groups}
          onChange={(n) => update((d) => { d.team.groups = n; })}
          factory={() => withKey({ dept: '새 그룹', members: [] })}
          addLabel="그룹 추가"
          emptyHint="부서/역할별 그룹을 추가하세요."
          render={(_, gi) => (
            <>
              <TextInput
                value={doc.team.groups[gi].dept}
                onChange={(e) => update((d) => { d.team.groups[gi].dept = e.target.value; })}
                placeholder="부서/역할"
              />
              <div className="mt-3 border-l-2 border-line pl-3">
                <RepeatList
                  items={doc.team.groups[gi].members}
                  onChange={(n) => update((d) => { d.team.groups[gi].members = n; })}
                  factory={() => withKey({ name: '', en: '' })}
                  addLabel="팀원 추가"
                  emptyHint="이 그룹의 팀원을 추가하세요."
                  render={(_, mi) => (
                    <div className="grid grid-cols-2 gap-2">
                      <TextInput
                        value={doc.team.groups[gi].members[mi].name}
                        onChange={(e) => update((d) => { d.team.groups[gi].members[mi].name = e.target.value; })}
                        placeholder="이름"
                      />
                      <TextInput
                        value={doc.team.groups[gi].members[mi].en}
                        onChange={(e) => update((d) => { d.team.groups[gi].members[mi].en = e.target.value; })}
                        placeholder="EN (선택)"
                      />
                    </div>
                  )}
                />
              </div>
            </>
          )}
        />
      </Sub>
      <LineListField
        label="요약 불릿"
        hint="한 줄에 하나씩 입력하세요."
        value={doc.team.bullets}
        onCommit={(n) => update((d) => { d.team.bullets = n; })}
        placeholder={'전원 정규직 전문 인력\n평균 경력 7년 이상'}
        rows={4}
        className="mt-6 border-t border-line pt-5"
      />
    </>
  );
}

/** 마크다운 편집 필드 — textarea + 간단 서식 툴바(제목/소제목/목록/굵게). 결과는 라이브 프리뷰로 확인. */
function MarkdownField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const applyLinePrefix = (prefix: string) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    onChange(value.slice(0, lineStart) + prefix + value.slice(lineStart));
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + prefix.length;
    });
  };

  const wrapSelection = (wrap: string) => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end } = ta;
    const sel = value.slice(start, end) || '텍스트';
    onChange(value.slice(0, start) + wrap + sel + wrap + value.slice(end));
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + wrap.length;
      ta.selectionEnd = start + wrap.length + sel.length;
    });
  };

  const tools: { label: string; fn: () => void }[] = [
    { label: '제목', fn: () => applyLinePrefix('## ') },
    { label: '소제목', fn: () => applyLinePrefix('### ') },
    { label: '목록', fn: () => applyLinePrefix('- ') },
    { label: '번호목록', fn: () => applyLinePrefix('1. ') },
    { label: '인용', fn: () => applyLinePrefix('> ') },
    { label: '굵게', fn: () => wrapSelection('**') },
    { label: '기울임', fn: () => wrapSelection('*') },
    { label: '구분선', fn: () => applyLinePrefix('\n---\n') },
    { label: '다이어그램', fn: () => applyLinePrefix('\n```mermaid\nflowchart LR\n  A[시작] --> B[다음] --> C[완료]\n```\n') },
  ];

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={t.fn}
            className="rounded-md border border-line bg-surface px-2.5 py-1 text-[12px] font-medium text-ink-600 transition-colors hover:border-blue-500/50 hover:text-blue-700"
          >
            {t.label}
          </button>
        ))}
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'## 소제목\n\n### 핵심 항목\n\n설명 문단...\n\n- 목록 항목'}
        className="h-[440px] w-full resize-y rounded-lg border border-line bg-surface px-3.5 py-3 font-mono text-[13px] leading-[1.7] text-ink-900 placeholder:text-ink-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
      <p className="mt-1.5 text-[12px] leading-[1.6] text-ink-400">
        마크다운: <code>## 제목</code> · <code>### 소제목</code> · <code>#### 소소제목</code> ·{' '}
        <code>- 목록</code> · <code>1. 번호</code> · <code>&gt; 인용</code> · <code>**굵게**</code> ·{' '}
        <code>*기울임*</code> · <code>`코드`</code> · <code>~~취소선~~</code> · <code>[링크](url)</code> ·{' '}
        <code>---</code> 구분선 · <code>```mermaid</code> 플로우차트. 오른쪽 미리보기로 결과를 확인하세요.
      </p>
    </div>
  );
}

function AnalysisEditor({ doc, update }: EditorProps) {
  return (
    <>
      <TitleField value={doc.analysis.title} onChange={(v) => update((d) => { d.analysis.title = v; })} />
      <Sub label="분석 내용 (마크다운)">
        <MarkdownField
          value={doc.analysis.content}
          onChange={(v) => update((d) => { d.analysis.content = v; })}
        />
      </Sub>
    </>
  );
}

function StrategyEditor({ doc, update }: EditorProps) {
  return (
    <>
      <TitleField value={doc.strategy.title} onChange={(v) => update((d) => { d.strategy.title = v; })} />
      <Sub label="전략 카드">
        <RepeatList
          items={doc.strategy.items}
          onChange={(n) => update((d) => { d.strategy.items = n.map((it, k) => ({ ...it, index: String(k + 1).padStart(2, '0') })); })}
          factory={() => withKey({ index: '', title: '새 전략', body: '', tag: '' })}
          addLabel="전략 추가"
          emptyHint="실행 전략 카드를 추가하세요."
          render={(_, i) => (
            <>
              <TextInput
                value={doc.strategy.items[i].title}
                onChange={(e) => update((d) => { d.strategy.items[i].title = e.target.value; })}
                placeholder="제목"
              />
              <TextArea
                value={doc.strategy.items[i].body}
                onChange={(e) => update((d) => { d.strategy.items[i].body = e.target.value; })}
                className="mt-2 h-[80px]"
                placeholder="설명"
              />
              <TextInput
                value={doc.strategy.items[i].tag}
                onChange={(e) => update((d) => { d.strategy.items[i].tag = e.target.value; })}
                className="mt-2"
                placeholder="배지 문구"
              />
            </>
          )}
        />
      </Sub>
    </>
  );
}

function EstimateEditor({ doc, update }: EditorProps) {
  return (
    <>
      <TitleField value={doc.estimate.title} onChange={(v) => update((d) => { d.estimate.title = v; })} />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="비용">
          <TextInput value={doc.estimate.cost} onChange={(e) => update((d) => { d.estimate.cost = e.target.value; })} />
        </Field>
        <Field label="기간">
          <TextInput value={doc.estimate.period} onChange={(e) => update((d) => { d.estimate.period = e.target.value; })} />
        </Field>
        <Field label="하자보수">
          <TextInput value={doc.estimate.warranty} onChange={(e) => update((d) => { d.estimate.warranty = e.target.value; })} />
        </Field>
      </div>
      <Field label="비고" className="mt-4">
        <TextArea
          value={doc.estimate.note}
          onChange={(e) => update((d) => { d.estimate.note = e.target.value; })}
          className="h-[80px]"
        />
      </Field>
    </>
  );
}

function PortfolioEditor({
  doc,
  update,
  portfolioSlugs,
  togglePortfolio,
}: EditorProps & { portfolioSlugs: string[]; togglePortfolio: (slug: string) => void }) {
  return (
    <>
      <TitleField value={doc.portfolio.title} onChange={(v) => update((d) => { d.portfolio.title = v; })} />
      <Field label="설명 (선택)" hint="[소제목] 줄로 그룹을 구분할 수 있습니다." className="mt-4">
        <TextArea
          value={doc.portfolio.description ?? ''}
          onChange={(e) => update((d) => { d.portfolio.description = e.target.value; })}
          className="h-[140px]"
          placeholder="[중개·매칭 플랫폼 구축]&#10;누적 사용자 800만 명 이상…"
        />
      </Field>
      <Sub label="포함할 포트폴리오">
        <div className="flex flex-wrap gap-2">
          {PROJECTS.map((p) => {
            const selected = portfolioSlugs.includes(p.slug);
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => togglePortfolio(p.slug)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                  selected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-line bg-surface text-ink-600 hover:border-blue-400',
                )}
              >
                {portfolioLabelText(p.title)}
              </button>
            );
          })}
        </div>
      </Sub>
    </>
  );
}

function ArchitectureEditor({ doc, update }: EditorProps) {
  return (
    <>
      <TitleField value={doc.architecture.title} onChange={(v) => update((d) => { d.architecture.title = v; })} />
      <Field label="설명" className="mt-4">
        <TextArea
          value={doc.architecture.note}
          onChange={(e) => update((d) => { d.architecture.note = e.target.value; })}
          className="h-[70px]"
        />
      </Field>
      <Sub label="레이어">
        <RepeatList
          items={doc.architecture.layers}
          onChange={(n) => update((d) => { d.architecture.layers = n; })}
          factory={() => withKey({ key: 'NEW', label: '', body: '' })}
          addLabel="레이어 추가"
          emptyHint="아키텍처 레이어를 추가하세요."
          render={(_, i) => (
            <>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <TextInput
                  value={doc.architecture.layers[i].key}
                  onChange={(e) => update((d) => { d.architecture.layers[i].key = e.target.value; })}
                  placeholder="KEY"
                />
                <TextInput
                  value={doc.architecture.layers[i].label}
                  onChange={(e) => update((d) => { d.architecture.layers[i].label = e.target.value; })}
                  placeholder="라벨"
                />
              </div>
              <TextArea
                value={doc.architecture.layers[i].body}
                onChange={(e) => update((d) => { d.architecture.layers[i].body = e.target.value; })}
                className="mt-2 h-[70px]"
                placeholder="설명"
              />
            </>
          )}
        />
      </Sub>
    </>
  );
}

function QaEditor({ doc, update }: EditorProps) {
  return (
    <>
      <TitleField value={doc.qa.title} onChange={(v) => update((d) => { d.qa.title = v; })} />
      <Sub label="QA 항목">
        <RepeatList
          items={doc.qa.items}
          onChange={(n) => update((d) => { d.qa.items = n; })}
          factory={() => withKey({ area: '', work: '', done: '' })}
          addLabel="항목 추가"
          emptyHint="QA 점검 항목을 추가하세요."
          render={(_, i) => (
            <div className="grid gap-2">
              <TextInput value={doc.qa.items[i].area} onChange={(e) => update((d) => { d.qa.items[i].area = e.target.value; })} placeholder="영역" />
              <TextInput value={doc.qa.items[i].work} onChange={(e) => update((d) => { d.qa.items[i].work = e.target.value; })} placeholder="구현 내용" />
              <TextInput value={doc.qa.items[i].done} onChange={(e) => update((d) => { d.qa.items[i].done = e.target.value; })} placeholder="완료 기준" />
            </div>
          )}
        />
      </Sub>
    </>
  );
}

function TimelineEditor({ doc, update }: EditorProps) {
  return (
    <>
      <TitleField value={doc.timeline.title} onChange={(v) => update((d) => { d.timeline.title = v; })} />
      <Field label="총 주차" className="mt-4">
        <TextInput
          type="number"
          min={1}
          max={24}
          value={doc.timeline.totalWeeks}
          onChange={(e) => update((d) => { d.timeline.totalWeeks = Math.max(1, Number(e.target.value) || 1); })}
          className="w-28"
        />
      </Field>
      <Sub label="단계">
        <RepeatList
          items={doc.timeline.phases}
          onChange={(n) => update((d) => { d.timeline.phases = n; })}
          factory={() => withKey({ label: '새 단계', start: 1, end: 1, span: 'W1' })}
          addLabel="단계 추가"
          emptyHint="주차별 단계를 추가하세요."
          render={(_, i) => {
            const setSpan = (d: Doc) => {
              const p = d.timeline.phases[i];
              p.span = p.start === p.end ? `W${p.start}` : `W${p.start}-W${p.end}`;
            };
            return (
              <>
                <TextInput
                  value={doc.timeline.phases[i].label}
                  onChange={(e) => update((d) => { d.timeline.phases[i].label = e.target.value; })}
                  placeholder="단계명"
                />
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[12px] text-ink-500">시작주</span>
                  <TextInput
                    type="number"
                    min={1}
                    value={doc.timeline.phases[i].start}
                    onChange={(e) => update((d) => { d.timeline.phases[i].start = Math.max(1, Number(e.target.value) || 1); setSpan(d); })}
                    className="w-20"
                  />
                  <span className="text-[12px] text-ink-500">종료주</span>
                  <TextInput
                    type="number"
                    min={1}
                    value={doc.timeline.phases[i].end}
                    onChange={(e) => update((d) => { d.timeline.phases[i].end = Math.max(1, Number(e.target.value) || 1); setSpan(d); })}
                    className="w-20"
                  />
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {doc.timeline.phases[i].span}
                  </span>
                </div>
              </>
            );
          }}
        />
      </Sub>
    </>
  );
}

function WarrantyEditor({ doc, update }: EditorProps) {
  return (
    <>
      <TitleField value={doc.warranty.title} onChange={(v) => update((d) => { d.warranty.title = v; })} />
      <LineListField
        label="포함 항목"
        hint="한 줄에 하나씩 입력하세요."
        value={doc.warranty.included}
        onCommit={(n) => update((d) => { d.warranty.included = n; })}
        rows={4}
        className="mt-4"
      />
      <LineListField
        label="미포함 항목"
        hint="한 줄에 하나씩 입력하세요."
        value={doc.warranty.excluded}
        onCommit={(n) => update((d) => { d.warranty.excluded = n; })}
        rows={4}
        className="mt-6 border-t border-line pt-5"
      />
      <Sub label="인수인계 항목">
        <RepeatList
          items={doc.warranty.handoff}
          onChange={(n) => update((d) => { d.warranty.handoff = n; })}
          factory={() => withKey({ title: '', body: '' })}
          addLabel="항목 추가"
          emptyHint="인수인계 항목을 추가하세요."
          render={(_, i) => (
            <>
              <TextInput value={doc.warranty.handoff[i].title} onChange={(e) => update((d) => { d.warranty.handoff[i].title = e.target.value; })} placeholder="제목" />
              <TextArea value={doc.warranty.handoff[i].body} onChange={(e) => update((d) => { d.warranty.handoff[i].body = e.target.value; })} className="mt-2 h-[70px]" placeholder="설명" />
            </>
          )}
        />
      </Sub>
    </>
  );
}

function PromiseEditor({ doc, update }: EditorProps) {
  return (
    <>
      <TitleField value={doc.promise.title} onChange={(v) => update((d) => { d.promise.title = v; })} />
      <Field label="본문" className="mt-4">
        <TextArea
          value={doc.promise.body}
          onChange={(e) => update((d) => { d.promise.body = e.target.value; })}
          className="h-[120px]"
        />
      </Field>
      <LineListField
        label="다짐"
        hint="한 줄에 하나씩 입력하세요."
        value={doc.promise.commitments}
        onCommit={(n) => update((d) => { d.promise.commitments = n; })}
        rows={4}
        className="mt-6 border-t border-line pt-5"
      />
    </>
  );
}

/* ─────────── 라우터 ─────────── */

export function SectionEditor({
  sectionKey,
  doc,
  update,
  portfolioSlugs,
  togglePortfolio,
}: {
  sectionKey: string;
  doc: Doc;
  update: Update;
  portfolioSlugs: string[];
  togglePortfolio: (slug: string) => void;
}) {
  switch (sectionKey) {
    case 'greeting':
      return <GreetingEditor doc={doc} update={update} />;
    case 'about':
      return <AboutEditor doc={doc} update={update} />;
    case 'team':
      return <TeamEditor doc={doc} update={update} />;
    case 'analysis':
      return <AnalysisEditor doc={doc} update={update} />;
    case 'strategy':
      return <StrategyEditor doc={doc} update={update} />;
    case 'estimate':
      return <EstimateEditor doc={doc} update={update} />;
    case 'portfolio':
      return (
        <PortfolioEditor
          doc={doc}
          update={update}
          portfolioSlugs={portfolioSlugs}
          togglePortfolio={togglePortfolio}
        />
      );
    case 'architecture':
      return <ArchitectureEditor doc={doc} update={update} />;
    case 'qa':
      return <QaEditor doc={doc} update={update} />;
    case 'timeline':
      return <TimelineEditor doc={doc} update={update} />;
    case 'warranty':
      return <WarrantyEditor doc={doc} update={update} />;
    case 'promise':
      return <PromiseEditor doc={doc} update={update} />;
    default:
      return null;
  }
}
