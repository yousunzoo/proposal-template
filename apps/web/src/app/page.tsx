'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PROJECTS } from '@/entities/portfolio';
import { portfolioLabelText } from '@/lib/portfolio';
import { api } from '@/lib/api';
import { Button, Label, TextInput, TextArea, Eyebrow } from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  SAMPLE_INFO,
  SAMPLE_PROPOSAL,
  SAMPLE_PORTFOLIO,
  SAMPLE_PORTFOLIO_SLUGS,
  SAMPLE_TITLE,
} from '@/constants/sample';

export default function HomePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [categories, setCategories] = useState('');
  const [skills, setSkills] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [rawProposalContent, setRawProposalContent] = useState('');
  const [rawPortfolioContent, setRawPortfolioContent] = useState('');
  const [portfolioSlugs, setPortfolioSlugs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadSample() {
    setTitle(SAMPLE_TITLE);
    setClientName(SAMPLE_INFO.clientName);
    setCategories(SAMPLE_INFO.categories);
    setSkills(SAMPLE_INFO.skills);
    setBudget(SAMPLE_INFO.budget);
    setDuration(SAMPLE_INFO.duration);
    setRawProposalContent(SAMPLE_PROPOSAL);
    setRawPortfolioContent(SAMPLE_PORTFOLIO);
    setPortfolioSlugs(SAMPLE_PORTFOLIO_SLUGS);
  }

  function togglePortfolio(slug: string) {
    setPortfolioSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  async function handleSubmit() {
    setError(null);
    if (!title.trim() || !rawProposalContent.trim()) {
      setError('제안서 제목과 제안서 원본은 필수입니다.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.create({
        title,
        projectInfo: { clientName, categories, skills, budget, duration },
        rawProposalContent,
        rawPortfolioContent,
        portfolioSlugs,
      });
      await api.generate(created.id);
      router.push(`/proposals/${created.id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '생성에 실패했습니다.');
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-[880px] px-5 py-16 lg:px-8 lg:py-24">
      <div className="mb-6 flex justify-end">
        <Button variant="ghost" size="sm" type="button" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>
      <header className="mb-10">
        <Eyebrow label="Proposal Builder" />
        <h1 className="mt-4 text-[32px] font-bold leading-[1.25] tracking-[-0.6px] text-ink-900 lg:text-[40px]">
          제안서 원본으로
          <br />
          <span className="text-blue-600">전문 제안서 페이지</span>를 생성합니다
        </h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-ink-600 lg:text-base">
          프로젝트 정보와 제안서 원본을 입력하면 템플릿 기반 제안서로 변환합니다. 생성 후 내용을
          다듬고, 배포하면 고유 링크로 공개됩니다.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" onClick={loadSample} type="button">
            샘플 불러오기
          </Button>
          <Link
            href="/p/sample-game-commerce"
            className="text-sm font-medium text-brand-600 hover:text-brand-500"
          >
            발행 예시 보기 →
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {/* 프로젝트 정보 */}
        <section className="rounded-card border border-line bg-surface p-6 lg:p-7">
          <h2 className="text-[17px] font-bold text-ink-900">프로젝트 정보</h2>
          <p className="mt-1 text-[13px] text-ink-500">
            추후 admin API에서 자동으로 불러올 영역입니다.
          </p>
          <div className="mt-5 grid gap-4">
            <div>
              <Label htmlFor="title">제안서 제목 *</Label>
              <TextInput
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 디지털 게임 코드 쇼핑몰 재구축 제안서"
                className="mt-1.5"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="client">발주처</Label>
                <TextInput
                  id="client"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="예: 디지털 게임 코드 쇼핑몰"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="categories">카테고리</Label>
                <TextInput
                  id="categories"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  placeholder="예: 커머스 재구축"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="budget">예산</Label>
                <TextInput
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="예: 150,000,000원"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="duration">기간</Label>
                <TextInput
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="예: 180일"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="skills">기술 스택</Label>
              <TextInput
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="예: Next.js, React, Spring Boot, PostgreSQL, AWS"
                className="mt-1.5"
              />
            </div>
          </div>
        </section>

        {/* 제안서 원본 */}
        <section className="rounded-card border border-line bg-surface p-6 lg:p-7">
          <h2 className="text-[17px] font-bold text-ink-900">제안서 원본 *</h2>
          <p className="mt-1 text-[13px] text-ink-500">
            <code className="rounded bg-elevated px-1.5 py-0.5 text-blue-700">◼︎ 인사말</code> ·{' '}
            <code className="rounded bg-elevated px-1.5 py-0.5 text-blue-700">◼︎ 프로젝트 분석</code>{' '}
            · <code className="rounded bg-elevated px-1.5 py-0.5 text-blue-700">◼︎ 견적 요약</code> ·{' '}
            <code className="rounded bg-elevated px-1.5 py-0.5 text-blue-700">◼︎ 성공을 향한 약속</code>{' '}
            마커로 섹션을 구분합니다.
          </p>
          <TextArea
            value={rawProposalContent}
            onChange={(e) => setRawProposalContent(e.target.value)}
            placeholder="◼︎ 인사말&#10;안녕하세요...&#10;&#10;◼︎ 프로젝트 분석&#10;..."
            className="mt-4 h-[280px]"
          />
        </section>

        {/* 포트폴리오 */}
        <section className="rounded-card border border-line bg-surface p-6 lg:p-7">
          <h2 className="text-[17px] font-bold text-ink-900">관련 포트폴리오</h2>
          <p className="mt-1 text-[13px] text-ink-500">
            제안서에 노출할 포트폴리오를 선택합니다. 발행 페이지에서 클릭 시 상세로 이동합니다.
          </p>
          <TextArea
            value={rawPortfolioContent}
            onChange={(e) => setRawPortfolioContent(e.target.value)}
            placeholder="관련 포트폴리오 설명 원본 (선택)"
            className="mt-4 h-[100px]"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {PROJECTS.map((p) => {
              const selected = portfolioSlugs.includes(p.slug);
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => togglePortfolio(p.slug)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-line bg-surface text-ink-600 hover:border-blue-500/50',
                  )}
                >
                  {portfolioLabelText(p.title)}
                </button>
              );
            })}
          </div>
        </section>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button onClick={handleSubmit} disabled={submitting} type="button">
            {submitting ? '생성 중…' : '제안서 생성'}
          </Button>
        </div>
      </div>
    </main>
  );
}
