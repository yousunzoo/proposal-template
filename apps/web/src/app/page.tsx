'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PROJECTS } from '@/entities/portfolio';
import { portfolioLabelText } from '@/shared/lib/portfolio';
import { api } from '@/shared/lib/api';
import { ensureNotifyPermission, notify } from '@/shared/lib/notify';
import { Button, Label, TextInput, TextArea, Eyebrow, Card } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import {
  SAMPLE_INFO,
  SAMPLE_PROPOSAL,
  SAMPLE_PORTFOLIO,
  SAMPLE_PORTFOLIO_SLUGS,
  SAMPLE_TITLE,
} from '@/shared/config/sample';

export default function HomePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
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
    // 사용자 제스처(제출 클릭) 컨텍스트에서 알림 권한을 미리 확보한다.
    void ensureNotifyPermission();
    try {
      const created = await api.create({
        title,
        projectInfo: { skills, budget, duration },
        rawProposalContent,
        rawPortfolioContent,
        portfolioSlugs,
      });
      // AI 정제는 시간이 오래 걸린다 — 완료 시 다른 탭을 보고 있어도 알림으로 알린다.
      await api.generate(created.id);
      notify('제안서 생성 완료', {
        body: `"${title}" 제안서 정제가 끝났습니다. 편집 화면으로 이동하세요.`,
        onlyWhenHidden: true,
      });
      router.push(`/proposals/${created.id}/edit`);
    } catch (e) {
      const message = e instanceof Error ? e.message : '생성에 실패했습니다.';
      notify('제안서 생성 실패', { body: message, onlyWhenHidden: true });
      setError(message);
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[880px] px-5 py-16 lg:px-8 lg:py-24">
      <header className="mb-10">
        <Eyebrow label="Proposal Builder" />
        <h1 className="mt-4 text-h1 leading-[1.25] tracking-[-0.6px] text-ink-900 lg:text-display">
          제안서 원본으로
          <br />
          <span className="text-blue-600">전문 제안서 페이지</span>를 생성합니다
        </h1>
        <p className="mt-4 text-body leading-[1.7] text-ink-600 lg:text-base">
          프로젝트 정보와 제안서 원본을 입력하면 AI가 구조를 잡고 어색한 문장을 다듬어 전문 제안서
          페이지로 변환합니다. 생성 후 내용을 편집하고, 배포하면 고유 링크로 공개됩니다.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" onClick={loadSample} type="button">
            샘플 불러오기
          </Button>
          <Link
            href="/p/sample-culture-center"
            className="text-sm font-medium text-brand-600 hover:text-brand-500"
          >
            발행 예시 보기 →
          </Link>
          <Link href="/prompts" className="text-sm font-medium text-ink-500 hover:text-ink-900">
            AI 프롬프트 관리 →
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {/* 프로젝트 정보 */}
        <Card as="section" className="p-6 lg:p-7">
          <h2 className="text-lead text-ink-900">프로젝트 정보</h2>
          
          <div className="mt-5 grid gap-4">
            <div>
              <Label htmlFor="title">제안서 제목 *</Label>
              <TextInput
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 지역 문화센터 강좌 예약·수강 관리 플랫폼 구축 제안서"
                className="mt-1.5"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="budget">예산</Label>
                <TextInput
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="예: 요구사항 확정 후 협의"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="duration">기간</Label>
                <TextInput
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="예: 약 10주"
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
        </Card>

        {/* 제안서 원본 */}
        <Card as="section" className="p-6 lg:p-7">
          <h2 className="text-lead text-ink-900">제안서 원본 *</h2>
          <p className="mt-1 text-meta leading-[1.6] text-ink-500">
            형식에 상관없이 붙여넣으면 AI가 섹션으로 구조화하고 어색한 문장을 다듬습니다.{' '}
            <code className="rounded bg-elevated px-1.5 py-0.5 text-blue-700">◼︎</code> 마커로 섹션
            경계를 지정할 수도 있습니다 (선택).
          </p>
          <TextArea
            value={rawProposalContent}
            onChange={(e) => setRawProposalContent(e.target.value)}
            placeholder="◼︎ 인사말&#10;안녕하세요...&#10;&#10;◼︎ 프로젝트 분석&#10;..."
            className="mt-4 h-[280px]"
          />
        </Card>

        {/* 포트폴리오 */}
        <Card as="section" className="p-6 lg:p-7">
          <h2 className="text-lead text-ink-900">관련 포트폴리오</h2>
          <p className="mt-1 text-meta leading-[1.6] text-ink-500">
            제안서에 노출할 포트폴리오를 선택합니다. 선택하지 않으면 본문을 분석해 자동 추천합니다.
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
        </Card>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button onClick={handleSubmit} disabled={submitting} type="button">
            {submitting ? 'AI로 정제하는 중…' : '제안서 생성'}
          </Button>
        </div>
      </div>
    </main>
  );
}
