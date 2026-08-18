'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Label, TextInput } from '@/components/ui';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/';
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? '로그인에 실패했습니다.');
        return;
      }
      // 열린 리다이렉트 방지: 내부 경로만 허용
      router.replace(next.startsWith('/') && !next.startsWith('//') ? next : '/');
      router.refresh();
    } catch {
      setError('로그인 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-elevated px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[380px] rounded-card border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-16px_rgba(15,23,42,0.14)]"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">Admin</p>
        <h1 className="mt-2 text-[22px] font-bold tracking-[-0.01em] text-ink-900">관리자 로그인</h1>
        <p className="mt-1.5 text-[13px] text-ink-500">
          제안서 작성·편집은 관리자만 이용할 수 있습니다.
        </p>

        <div className="mt-6">
          <Label htmlFor="password" className="mb-1.5">
            비밀번호
          </Label>
          <TextInput
            id="password"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="mt-5 w-full">
          {submitting ? '확인 중…' : '로그인'}
        </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
