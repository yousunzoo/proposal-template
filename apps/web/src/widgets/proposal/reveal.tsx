import type { ReactNode } from 'react';

/**
 * 가독성 우선 정책: 스크롤 진입 애니메이션을 사용하지 않는다.
 * (콘텐츠가 즉시 보이도록 Reveal/MotionRoot/RevealStatic 모두 정적 패스스루)
 * 컴포넌트 API는 유지해 호출부를 바꾸지 않는다.
 */

export function MotionRoot({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function RevealStatic({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  /** 하위호환용(무시됨) */
  delay?: number;
}) {
  return <div className={className}>{children}</div>;
}
