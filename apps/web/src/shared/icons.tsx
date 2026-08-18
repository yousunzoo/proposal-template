import type { SVGProps } from 'react';

/**
 * 포트폴리오 상세에서 사용하는 아이콘 세트 (lucide 스타일, 로컬 정의).
 * clickb 전체 아이콘 라이브러리를 포팅하지 않고 필요한 6개만 유지한다.
 */

type IconProps = SVGProps<SVGSVGElement> & { width?: number; height?: number };

function base(props: IconProps) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    width: props.width ?? 24,
    height: props.height ?? 24,
  };
}

export function ArrowRight(props: IconProps) {
  return (
    <svg {...base(props)} {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function ChevronRight(props: IconProps) {
  return (
    <svg {...base(props)} {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function Check(props: IconProps) {
  return (
    <svg {...base(props)} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Calendar(props: IconProps) {
  return (
    <svg {...base(props)} {...props}>
      <path d="M8 2v4M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

export function Layers(props: IconProps) {
  return (
    <svg {...base(props)} {...props}>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}

export function PenTool(props: IconProps) {
  return (
    <svg {...base(props)} {...props}>
      <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" />
      <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" />
      <path d="m2.3 2.3 7.286 7.286" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}
