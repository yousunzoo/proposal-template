import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow } from '@/shared/ui';
import { PromptManager } from '@/features/prompt-admin';

export const metadata: Metadata = {
  title: 'AI 프롬프트 관리',
  robots: { index: false, follow: false },
};

export default function PromptsPage() {
  return (
    <main className="mx-auto w-full max-w-[880px] px-5 py-16 lg:px-8 lg:py-24">
      <header className="mb-10">
        <Eyebrow label="Admin" />
        <h1 className="mt-4 text-h1 tracking-[-0.6px] text-ink-900">AI 프롬프트 관리</h1>
        <p className="mt-4 text-body leading-[1.7] text-ink-600">
          제안서 원문을 섹션으로 구조화할 때 사용하는 AI 프롬프트를 편집·저장합니다. 저장한 값은 즉시
          다음 생성부터 적용되며, 비워서 저장하면 코드 기본값으로 되돌아갑니다.
        </p>
        <div className="mt-6">
          <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            ← 홈으로
          </Link>
        </div>
      </header>
      <PromptManager />
    </main>
  );
}
