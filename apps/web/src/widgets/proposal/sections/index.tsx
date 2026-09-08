import Link from 'next/link';
import Image from 'next/image';
import type { ProjectInfo, ProposalSectionsData } from '@proposal/shared';
import { PROJECTS } from '@/entities/portfolio';
import { portfolioLabel } from '@/shared/lib/portfolio';
import { Reveal } from '@/widgets/proposal/reveal';
import { Eyebrow, Chip, cardInteractiveClass } from '@/shared/ui';
import { ArrowRight, Check } from '@/shared/ui/icons';
import { Markdown } from '@/widgets/proposal/markdown';
import { cn } from '@/shared/lib/cn';

type Doc = ProposalSectionsData;

/* ── 공통 셸 ── */
function SectionShell({
  id,
  index,
  label,
  title,
  children,
  tone = 'base',
}: {
  id: string;
  index: string;
  label: string;
  title: string;
  children: React.ReactNode;
  tone?: 'base' | 'elevated';
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className={cn(
        'section-anchor scroll-mt-24 border-t border-line py-20 lg:py-28',
        tone === 'elevated' && 'bg-elevated',
      )}
    >
      <div className="shell px-5 lg:px-8">
        <Reveal>
          <Eyebrow index={index} label={label} />
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-4 text-h3 leading-[1.22] tracking-[-0.02em] text-ink-900 lg:text-h1">
            {title || label}
          </h2>
        </Reveal>
        <div className="mt-9 lg:mt-12">{children}</div>
      </div>
    </section>
  );
}

const cardCls = cardInteractiveClass;

/** 표시된 섹션에 데이터가 없을 때의 조용한 안내 (빈 껍데기 방지) */
function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-card border border-dashed border-line bg-elevated px-5 py-8 text-center text-body-sm text-ink-500">
      {children}
    </p>
  );
}

/** 01, 02 … 형식의 2자리 번호 */
function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/* ══════════════ 1. Hero (인사말) ══════════════ */
export function HeroSection({
  title,
  greeting,
  info,
}: {
  title: string;
  greeting: Doc['greeting'];
  info: ProjectInfo;
}) {
  const headline = greeting.title?.trim() || title;
  const intro = greeting.intro?.trim() ?? '';
  const paragraphs = toParagraphs(greeting.body ?? '');
  const meta: { k: string; v: string }[] = [];
  if (info.budget) meta.push({ k: '예산', v: info.budget });
  if (info.duration) meta.push({ k: '기간', v: info.duration });
  return (
    <section id="greeting" aria-label="인사말" className="section-anchor scroll-mt-24">
      <div className="shell px-5 py-20 lg:px-8 lg:py-28">
        <h1 className="mt-4 text-h1 leading-[1.12] tracking-[-0.03em] text-ink-900 lg:text-hero">
          {headline}
        </h1>
        {intro && (
          <p className="mt-6 text-lead leading-[1.7] text-ink-600 lg:text-xl">
            {intro}
          </p>
        )}
        {meta.length > 0 && (
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
            {meta.map((m) => (
              <div key={m.k} className="flex flex-col gap-1">
                <dt className="text-caption font-medium text-ink-500">{m.k}</dt>
                <dd className="text-body font-semibold text-ink-900">{m.v}</dd>
              </div>
            ))}
          </dl>
        )}
        {/* 동적 인사말 본문(원문/AI 도출) */}
        {paragraphs.length > 0 && (
          <div className="mt-10 flex flex-col gap-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-body leading-[1.85] text-ink-600 lg:text-base">
                {p}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ══════════════ 2. 회사 소개 ══════════════ */
export function AboutSection({ about, index }: { about: Doc['about']; index: string }) {
  return (
    <SectionShell id="about" index={index} label="회사 소개" title={about.title}>
      <div className=" flex flex-col gap-4">
        {about.intro.map((p, i) => (
          <Reveal key={i} delay={i * 0.04}>
            <p className="text-body leading-[1.85] tracking-[-0.3px] text-ink-600 lg:text-base">
              {p}
            </p>
          </Reveal>
        ))}
      </div>
      {about.values.length > 0 && (
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {about.values.map((v, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className={cn(cardCls, 'flex h-full flex-col gap-3 p-6 lg:p-7')}>
                <span className="text-sm font-semibold tabular-nums text-blue-600">{pad2(i + 1)}</span>
                <h3 className="text-lg font-bold tracking-[-0.4px] text-ink-900 lg:text-xl">
                  {v.title}
                </h3>
                <p className="text-body-sm leading-[1.7] text-ink-600 lg:text-body">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* ══════════════ 3. 프로젝트 분석 ══════════════ */
export function AnalysisSection({ analysis, index }: { analysis: Doc['analysis']; index: string }) {
  return (
    <SectionShell id="analysis" index={index} label="프로젝트 분석" title={analysis.title}>
      <Markdown content={analysis.content} />
    </SectionShell>
  );
}

/* ══════════════ 5. 실행 전략 ══════════════ */
export function StrategySection({ strategy, index }: { strategy: Doc['strategy']; index: string }) {
  return (
    <SectionShell id="strategy" index={index} label="실행 전략" title={strategy.title} tone="elevated">
      {strategy.items.length === 0 ? (
        <EmptyNote>실행 전략이 아직 없습니다.</EmptyNote>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {strategy.items.map((s, i) => (
            <Reveal key={i} delay={(i % 2) * 0.05}>
              <div className={cn(cardCls, 'flex h-full flex-col p-6 lg:p-7')}>
                <span className="text-body font-semibold tabular-nums text-blue-600">{s.index}</span>
                <h3 className="mt-2 text-lg font-bold tracking-[-0.4px] text-ink-900 lg:text-xl">
                  {s.title}
                </h3>
                <p className="mt-3 text-body leading-[1.7] text-ink-600">{s.body}</p>
                {s.tag && (
                  <div className="mt-6">
                    <Chip>{s.tag}</Chip>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* ══════════════ 6. 견적 요약 ══════════════ */
export function EstimateSection({ estimate, index }: { estimate: Doc['estimate']; index: string }) {
  const metrics = [
    { label: '제안 비용', value: estimate.cost || '협의' },
    { label: '수행 기간', value: estimate.period || '협의' },
    { label: '하자보수', value: estimate.warranty || '협의' },
  ];
  return (
    <SectionShell id="estimate" index={index} label="견적 요약" title={estimate.title}>
      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 0.05}>
            <div className={cn(cardCls, 'p-7')}>
              <p className="text-meta font-medium text-ink-500">{m.label}</p>
              <p className="mt-3 text-h2 tracking-[-0.8px] text-ink-900 lg:text-h1">
                {m.value}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      {estimate.note && (
        <Reveal delay={0.1}>
          <p className="mt-6 whitespace-pre-line rounded-xl border border-line bg-elevated px-5 py-4 text-meta leading-[1.7] text-ink-500">
            ※ {estimate.note}
          </p>
        </Reveal>
      )}
    </SectionShell>
  );
}

/* ══════════════ 7. 관련 포트폴리오 ══════════════ */
export function PortfolioSection({
  portfolio,
  portfolioSlugs,
  itemBase,
  index,
}: {
  portfolio: Doc['portfolio'];
  portfolioSlugs: string[];
  itemBase: string;
  index: string;
}) {
  const items = PROJECTS.filter((p) => portfolioSlugs.includes(p.slug));
  const descParas = portfolio.description ? toParagraphs(portfolio.description) : [];
  return (
    <SectionShell id="portfolio" index={index} label="관련 포트폴리오" title={portfolio.title} tone="elevated">
      {descParas.length > 0 && (
        <div className="mb-12 flex flex-col gap-5">
          {descParas.map((p, i) => {
            const head = p.match(/^\[(.+?)\]\s*([\s\S]*)$/);
            if (head) {
              return (
                <div key={i}>
                  <h3 className="text-base font-bold tracking-[-0.01em] text-ink-900">
                    {head[1].trim()}
                  </h3>
                  {head[2].trim() && (
                    <p className="mt-2 text-body leading-[1.8] text-ink-600">
                      {head[2].trim().replace(/\n+/g, ' ')}
                    </p>
                  )}
                </div>
              );
            }
            return (
              <p key={i} className="text-body leading-[1.8] text-ink-600">
                {p.replace(/\n+/g, ' ')}
              </p>
            );
          })}
        </div>
      )}
      {items.length === 0 ? (
        descParas.length === 0 && <EmptyNote>연결된 포트폴리오가 없습니다.</EmptyNote>
      ) : (
        <ul className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ slug, thumbnail, title, category }, i) => (
            <li key={slug}>
              <Reveal delay={(i % 3) * 0.05}>
                <Link
                  href={`${itemBase}/${slug}`}
                  className="group flex h-full flex-col rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-line">
                    <Image
                      src={thumbnail}
                      alt={`${title} 썸네일`}
                      fill
                      sizes="(max-width: 640px) 100vw, 360px"
                      className="object-cover"
                    />
                    <span className="absolute bottom-3 right-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface/95 px-3 text-caption font-semibold text-blue-700 transition-colors duration-200 group-hover:border-blue-500 group-hover:bg-blue-600 group-hover:text-white">
                      더보기
                      <ArrowRight
                        width={13}
                        height={13}
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                  <div className="mt-4 flex flex-1 flex-col">
                    <span className="text-caption font-medium text-ink-500">{category}</span>
                    <h3 className="mt-1 text-lead font-semibold tracking-[-0.01em] text-ink-900 transition-colors duration-200 group-hover:text-blue-600">
                      {portfolioLabel(title).name}
                      {portfolioLabel(title).descriptor && (
                        <span className="mt-0.5 block text-body-sm font-normal text-ink-500">
                          {portfolioLabel(title).descriptor}
                        </span>
                      )}
                    </h3>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}

/* ══════════════ 8. 시스템 아키텍처 ══════════════ */
export function ArchitectureSection({
  architecture,
  index,
}: {
  architecture: Doc['architecture'];
  index: string;
}) {
  return (
    <SectionShell id="architecture" index={index} label="시스템 아키텍처" title={architecture.title}>
      {architecture.note && (
        <Reveal>
          <p className=" -mt-4 mb-10 text-body leading-[1.7] text-ink-600 lg:text-base">
            {architecture.note}
          </p>
        </Reveal>
      )}
      {architecture.layers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {architecture.layers.map((l, i) => (
            <Reveal key={i} delay={(i % 4) * 0.04}>
              <div className={cn(cardCls, 'flex h-full flex-col gap-3 p-6')}>
                <Chip>{l.key}</Chip>
                <p className="text-base font-semibold text-ink-900">{l.label}</p>
                <p className="text-body-sm leading-[1.65] text-ink-600">{l.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* ══════════════ 9. QA 계획 ══════════════ */
export function QaSection({ qa, index }: { qa: Doc['qa']; index: string }) {
  return (
    <SectionShell id="qa" index={index} label="QA 계획" title={qa.title} tone="elevated">
      {qa.items.length === 0 ? (
        <EmptyNote>QA 항목이 아직 없습니다.</EmptyNote>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-elevated">
                <th scope="col" className="w-[180px] px-6 py-3.5 text-meta font-semibold text-ink-500">영역</th>
                <th scope="col" className="px-6 py-3.5 text-meta font-semibold text-ink-500">구현 내용</th>
                <th scope="col" className="px-6 py-3.5 text-meta font-semibold text-ink-500">완료 기준</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {qa.items.map((q, i) => (
                <tr key={i}>
                  <th scope="row" className="px-6 py-4 align-top text-body-sm font-semibold text-blue-600">
                    {q.area}
                  </th>
                  <td className="px-6 py-4 align-top text-body-sm leading-[1.6] text-ink-700">{q.work}</td>
                  <td className="px-6 py-4 align-top text-body-sm leading-[1.6] text-ink-600">
                    <span className="flex items-start gap-2">
                      <Check width={16} height={16} aria-hidden className="mt-0.5 shrink-0 text-blue-600" />
                      <span>{q.done}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionShell>
  );
}

/* ══════════════ 10. 진행 일정 (간트) ══════════════ */
export function TimelineSection({ timeline, index }: { timeline: Doc['timeline']; index: string }) {
  const weeks = Math.max(1, timeline.totalWeeks);
  return (
    <SectionShell id="timeline" index={index} label="진행 일정" title={timeline.title}>
      {timeline.phases.length === 0 ? (
        <EmptyNote>진행 단계가 아직 없습니다.</EmptyNote>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div
                className="grid gap-1 pl-[180px]"
                style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: weeks }, (_, i) => (
                  <div key={i} className="pb-2 text-center text-caption font-medium text-ink-500">
                    {i + 1}주
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {timeline.phases.map((p, i) => (
                  <Reveal key={i}>
                    <div className="grid items-center" style={{ gridTemplateColumns: '180px 1fr' }}>
                      <span className="pr-4 text-body-sm font-semibold text-ink-700">{p.label}</span>
                      <div
                        className="grid gap-1 rounded-lg bg-elevated p-1"
                        style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}
                      >
                        <div
                          className="flex h-9 items-center justify-center rounded-md bg-blue-600 text-caption font-semibold text-white"
                          style={{
                            gridColumn: `${Math.min(p.start, weeks)} / ${Math.min(p.end, weeks) + 1}`,
                          }}
                        >
                          {p.span}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
          <Reveal delay={0.1}>
            <p className="mt-8 rounded-xl border border-line bg-elevated px-5 py-4 text-body-sm leading-[1.7] text-ink-600">
              슬랙·카카오톡 등 메신저로 진행 상황과 결정 필요사항을 긴밀히 공유합니다. 계획에 변경이
              생기더라도 일정에 맞춰 결과물을 전달합니다.
            </p>
          </Reveal>
        </>
      )}
    </SectionShell>
  );
}

/* ══════════════ 11. 하자보수·인수인계 ══════════════ */
export function WarrantySection({ warranty, index }: { warranty: Doc['warranty']; index: string }) {
  return (
    <SectionShell id="warranty" index={index} label="하자보수·인수인계" title={warranty.title} tone="elevated">
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className={cn(cardCls, 'grid h-full gap-6 p-6 sm:grid-cols-2')}>
            <div>
              <p className="mb-3 text-meta font-semibold text-green-600">포함 항목</p>
              <ul className="flex flex-col gap-2.5">
                {warranty.included.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-body-sm text-ink-700">
                    <Check width={16} height={16} aria-hidden className="mt-0.5 shrink-0 text-green-600" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-meta font-semibold text-ink-500">미포함 (별도 협의)</p>
              <ul className="flex flex-col gap-2.5">
                {warranty.excluded.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-body-sm text-ink-500">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-400" aria-hidden />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className={cn(cardCls, 'flex h-full flex-col gap-4 p-6')}>
            <p className="text-meta font-semibold text-blue-600">인수인계 항목</p>
            {warranty.handoff.map((h, i) => (
              <div key={i}>
                <p className="text-body font-semibold text-ink-900">{h.title}</p>
                <p className="mt-1 text-body-sm leading-[1.65] text-ink-600">{h.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}

/* ══════════════ 12. 성공을 향한 약속 ══════════════ */
export function PromiseSection({ promise, index }: { promise: Doc['promise']; index: string }) {
  const paragraphs = toParagraphs(promise.body ?? '');
  return (
    <section
      id="promise"
      aria-label="성공을 향한 약속"
      className="section-anchor scroll-mt-24 border-t border-line"
    >
      <div className="shell px-5 py-20 lg:px-8 lg:py-28">
        <Reveal>
          <Eyebrow index={index} label="맺음말" />
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-4 text-h3 leading-[1.22] tracking-[-0.02em] text-ink-900 lg:text-h1">
            {promise.title}
          </h2>
        </Reveal>
        {paragraphs.map((p, i) => (
          <Reveal key={i} delay={0.1 + i * 0.05}>
            <p className=" mt-5 text-body leading-[1.85] text-ink-600 lg:text-lead">
              {p}
            </p>
          </Reveal>
        ))}
        {promise.commitments.length > 0 && (
          <div className="mt-10 grid gap-x-10 gap-y-6 border-t border-line pt-8 lg:grid-cols-3">
            {promise.commitments.map((c, i) => (
              <Reveal key={i}>
                <div className="flex gap-3">
                  <span className="text-body font-semibold tabular-nums text-blue-600">
                    {pad2(i + 1)}
                  </span>
                  <p className="text-body leading-[1.7] text-ink-700">{c}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
