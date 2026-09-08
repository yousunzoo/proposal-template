import Image from 'next/image';
import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';
import type { ContentBlock } from '@proposal/shared';
import type { Project } from '@/entities/portfolio';
import { ContentBlockView } from '@/widgets/proposal/sections/blocks';
import { ArrowRight, Calendar, Check, ChevronRight, Layers, PenTool } from '@/shared/ui/icons';

/** category 문자열("WEB, Commerce, AI")을 개별 유형 토큰으로 파싱 */
const parseTypes = (category: string) =>
  category
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);

/** 유형 토큰 표기 정규화 ("commerce" → "Commerce", "WEB" → "WEB") */
const formatType = (type: string) =>
  type === type.toLowerCase() ? type.charAt(0).toUpperCase() + type.slice(1) : type;

/** description 원문을 케이스 스터디용 구조 블록으로 파싱 */
const parseContent = (description: string): ContentBlock[] =>
  description
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block): ContentBlock => {
      // [담당 역할] 형태의 섹션 헤딩
      const heading = block.match(/^\[(.+)\]$/);
      if (heading) {
        return { kind: 'heading', text: heading[1].trim() };
      }

      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      // "- 항목" 으로만 이뤄진 불릿 리스트
      if (lines.length > 0 && lines.every((line) => /^[-•]\s+/.test(line))) {
        return { kind: 'list', items: lines.map((line) => line.replace(/^[-•]\s+/, '')) };
      }

      // "1. 제목" + 본문 형태의 번호형 기능 블록
      const feature = lines[0]?.match(/^(\d+)\.\s+(.+)$/);
      if (feature && lines.length > 1) {
        return {
          kind: 'feature',
          index: feature[1].padStart(2, '0'),
          title: feature[2].trim(),
          body: lines.slice(1).join(' '),
        };
      }

      return { kind: 'paragraph', text: lines.join(' ') };
    });

/** 섹션 번호 + 라벨 eyebrow */
const SectionEyebrow = ({ index, label }: { index: string; label: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm font-semibold tabular-nums text-blue-600">{index}</span>
    <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 lg:text-sm">
      {label}
    </span>
  </div>
);

export interface PortfolioNav {
  /** 브레드크럼 "홈" 링크 */
  homeHref: string;
  /** 브레드크럼/전체보기 목록 링크 */
  listHref: string;
  /** 목록 라벨 (예: "포트폴리오", "관련 포트폴리오") */
  listLabel: string;
  /** 관련 프로젝트 아이템 링크 base (`${itemBase}/${slug}`) */
  itemBase: string;
  /** 하단 CTA 링크 */
  contactHref: string;
}

const DEFAULT_NAV: PortfolioNav = {
  homeHref: '/',
  listHref: '/portfolio',
  listLabel: '포트폴리오',
  itemBase: '/portfolio',
  contactHref: '/',
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas';

interface PortfolioDetailProps {
  project: Project;
  detailContent: ReactNode;
  relatedProjects: Project[];
  nav?: PortfolioNav;
}

export const PortfolioDetail = ({
  project,
  detailContent,
  relatedProjects,
  nav = DEFAULT_NAV,
}: PortfolioDetailProps) => {
  const types = parseTypes(project.category);

  // 첫 문단은 히어로 리드로 승격, 나머지는 본문 블록으로 사용
  const blocks = parseContent(project.description);
  const leadIndex = blocks.findIndex((block) => block.kind === 'paragraph');
  const summary =
    leadIndex >= 0 ? (blocks[leadIndex] as { text: string }).text : null;
  const bodyBlocks = leadIndex >= 0 ? blocks.filter((_, i) => i !== leadIndex) : blocks;

  const metaItems: {
    icon: ComponentType<{ width?: number; height?: number; className?: string }>;
    label: string;
    value: string;
  }[] = [
    {
      icon: Layers,
      label: '프로젝트 유형',
      value: types.map(formatType).join(' · ') || project.category,
    },
    { icon: Calendar, label: '개발 기간', value: project.period || '협의 후 진행' },
    { icon: PenTool, label: '진행 범위', value: '기획 · 디자인 · 개발' },
  ];

  return (
    <main className="w-full flex-1">
      {/* ══════════════ 라이트 본문 밴드 (풀블리드) ══════════════ */}
      <div className="bg-elevated text-ink-900">
        <div className="shell px-5 py-12 lg:px-8 lg:py-20">
          {/* ── 브레드크럼 ── */}
          <nav aria-label="브레드크럼">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm tracking-[-0.28px] text-ink-500 lg:text-base">
              <li>
                <Link
                  href={nav.homeHref}
                  className={`rounded transition-colors hover:text-ink-800 ${focusRing}`}
                >
                  홈
                </Link>
              </li>
              <li aria-hidden="true" className="flex items-center">
                <ChevronRight width={16} height={16} className="text-ink-400" />
              </li>
              <li>
                <Link
                  href={nav.listHref}
                  className={`rounded transition-colors hover:text-ink-800 ${focusRing}`}
                >
                  {nav.listLabel}
                </Link>
              </li>
              <li aria-hidden="true" className="flex items-center">
                <ChevronRight width={16} height={16} className="text-ink-400" />
              </li>
              <li aria-current="page" className="truncate text-ink-700">
                {project.title}
              </li>
            </ol>
          </nav>

          {/* ── 히어로 ── */}
          <header className="pt-6 lg:pt-10">
            <h1 className="text-h2 font-semibold leading-[1.2] tracking-[-0.6px] text-ink-900 lg:text-hero lg:tracking-[-1.3px]">
              {project.title}
            </h1>

            {summary && (
              <p className="mt-5 text-lg leading-[1.65] tracking-[-0.4px] text-ink-600 lg:mt-7 lg:text-title lg:leading-[1.6]">
                {summary}
              </p>
            )}

            {/* 키워드: badge 형태 */}
            {project.keyword.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2 lg:mt-8">
                {project.keyword.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-line bg-surface px-3 py-1 text-sm font-medium tracking-[-0.28px] text-ink-600"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </header>

          {/* ── 메타 정보 스펙 스트립 ── */}
          <section aria-label="프로젝트 개요" className="mt-10 lg:mt-14">
            <dl className="flex flex-col gap-6 border-y border-line py-6 sm:flex-row sm:items-stretch sm:gap-0 lg:py-7">
              {metaItems.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-2 sm:flex-1 sm:px-7 sm:first:pl-0 sm:last:pr-0 sm:[&+&]:border-l sm:[&+&]:border-line"
                >
                  <div className="flex items-center gap-1.5 text-ink-500">
                    <Icon width={15} height={15} className="shrink-0" />
                    <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ink-500 lg:text-meta">
                      {label}
                    </dt>
                  </div>
                  <dd className="text-lg font-semibold leading-[1.4] tracking-[-0.36px] text-ink-900 lg:text-xl">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ── 프로젝트 소개 ── */}
          {bodyBlocks.length > 0 && (
            <section aria-labelledby="portfolio-overview-heading" className="mt-16 lg:mt-28">
              <SectionEyebrow index="01" label="Overview" />
              <h2
                id="portfolio-overview-heading"
                className="mt-4 text-2xl font-semibold leading-[1.3] tracking-[-0.6px] text-ink-900 lg:text-h1 lg:tracking-[-0.96px]"
              >
                프로젝트 소개
              </h2>
              <div className="mt-8 flex flex-col gap-5 lg:mt-10 lg:gap-6">
                {bodyBlocks.map((block, i) => (
                  <ContentBlockView key={i} block={block} />
                ))}
              </div>
            </section>
          )}

          {/* ── 프로젝트 화면 ── */}
          <section aria-labelledby="portfolio-screens-heading" className="mt-16 lg:mt-28">
            <SectionEyebrow index={bodyBlocks.length > 0 ? '02' : '01'} label="Showcase" />
            <h2
              id="portfolio-screens-heading"
              className="mt-4 text-2xl font-semibold leading-[1.3] tracking-[-0.6px] text-ink-900 lg:text-h1 lg:tracking-[-0.96px]"
            >
              프로젝트 화면
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center overflow-hidden rounded-card ring-1 ring-line lg:mt-10">
              {detailContent}
            </div>
          </section>
        </div>
      </div>

      {/* ══════════════ 하단 (CTA · 관련 프로젝트) ══════════════ */}

      {/* ── CTA ── */}
      <section
        aria-labelledby="portfolio-cta-heading"
        className="shell px-5 py-20 lg:px-8 lg:py-28"
      >
        <div className="border-t border-line pt-12 lg:pt-16">
          <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 lg:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden="true" />
            Next
          </p>

          <div className="mt-6 flex flex-col gap-10 lg:mt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <h2
              id="portfolio-cta-heading"
              className="text-h1 font-semibold leading-[1.15] tracking-[-0.8px] text-ink-900 lg:text-hero lg:tracking-[-1.8px]"
            >
              이런 프로젝트,
              <br />
              함께 만들어볼까요?
            </h2>

            <div className="flex shrink-0 flex-col gap-6 lg:items-end">
              <p className="text-base leading-[1.7] tracking-[-0.32px] text-ink-600 lg:text-right">
                기획·디자인·개발까지, 처음부터 끝까지 함께합니다.
              </p>
              <Link
                href={nav.contactHref}
                className={`group inline-flex items-center gap-4 rounded-full text-lg font-semibold text-ink-900 transition-colors hover:text-blue-600 lg:text-xl ${focusRing}`}
              >
                제안서로 돌아가기
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition-colors duration-200 group-hover:bg-blue-500 lg:h-14 lg:w-14">
                  <ArrowRight width={22} height={22} aria-hidden="true" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 관련 프로젝트 ── */}
      {relatedProjects.length > 0 && (
        <section
          aria-labelledby="portfolio-related-heading"
          className="shell px-5 pb-16 lg:px-8 lg:pb-[120px]"
        >
          <div className="flex items-end justify-between gap-4">
            <h2
              id="portfolio-related-heading"
              className="text-2xl font-semibold leading-[1.3] tracking-[-0.6px] text-ink-900 lg:text-h1 lg:tracking-[-0.96px]"
            >
              다른 프로젝트
            </h2>
            <Link
              href={nav.listHref}
              className={`flex shrink-0 items-center gap-1 rounded text-sm font-medium tracking-[-0.28px] text-ink-600 transition-colors hover:text-ink-900 lg:text-base ${focusRing}`}
            >
              전체 보기
              <ChevronRight width={18} height={18} aria-hidden="true" />
            </Link>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-10 lg:grid-cols-3 lg:gap-x-6">
            {relatedProjects.map(({ slug, thumbnail, title, keyword }) => (
              <li key={slug}>
                <Link
                  href={`${nav.itemBase}/${slug}`}
                  className={`group flex h-full flex-col rounded-card ${focusRing}`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-card ring-1 ring-line transition-shadow duration-300 group-hover:shadow-[0_10px_28px_-16px_rgba(15,23,42,0.24)]">
                    <Image
                      src={thumbnail}
                      alt={`${title} 프로젝트 썸네일`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 360px"
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-4 flex flex-col gap-2 lg:mt-5">
                    <h3 className="text-lg font-semibold leading-[1.4] tracking-[-0.36px] text-ink-900 transition-colors duration-200 group-hover:text-blue-600 lg:text-xl">
                      {title}
                    </h3>
                    {keyword.length > 0 && (
                      <ul className="mt-1 flex flex-wrap gap-1.5">
                        {keyword.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full border border-line bg-elevated px-2.5 py-1 text-xs font-normal tracking-[-0.24px] text-ink-600"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
};
