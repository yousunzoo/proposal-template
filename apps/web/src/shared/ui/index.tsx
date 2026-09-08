import { cn } from '@/shared/lib/cn';
import type {
  ButtonHTMLAttributes,
  ElementType,
  HTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

/** 공통 카드 표면 — 흰 배경 + 헤어라인 보더 + radius 토큰. 패딩·레이아웃은 className으로 지정. */
export const cardClass = 'rounded-card border border-line bg-surface';

/** 호버 상호작용이 있는 카드 표면(목록/그리드 아이템용) */
export const cardInteractiveClass = cn(
  cardClass,
  'relative overflow-hidden transition-colors duration-200 hover:border-line-strong',
);

/** 카드 래퍼 — 기본 div, `as`로 시맨틱 태그(section 등) 지정 가능 */
export function Card({
  className,
  as: Tag = 'div',
  ...props
}: HTMLAttributes<HTMLElement> & { as?: ElementType }) {
  return <Tag className={cn(cardClass, className)} {...props} />;
}

/** Primary/secondary/ghost 버튼 — 라이트 테마 */
export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-[-0.01em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        size === 'sm' ? 'px-3.5 py-2 text-sm' : 'px-5 py-2.5 text-body',
        variant === 'primary' &&
          'bg-blue-600 text-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_6px_16px_-8px_rgba(0,126,229,0.5)] hover:bg-blue-500',
        variant === 'secondary' &&
          'border border-line bg-surface text-ink-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-line-strong hover:bg-elevated',
        variant === 'ghost' && 'text-ink-600 hover:bg-elevated hover:text-ink-900',
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('block text-sm font-semibold text-ink-700', className)} {...props} />
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-body text-ink-900 placeholder:text-ink-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
        className,
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full resize-y rounded-lg border border-line bg-surface px-3.5 py-3 text-body-sm leading-[1.7] text-ink-900 placeholder:text-ink-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
        className,
      )}
      {...props}
    />
  );
}

/** 섹션 마커 — 조용한 문서형 (번호 + 한글 라벨) */
export function Eyebrow({ index, label }: { index?: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      {index && (
        <span className="text-meta font-semibold tabular-nums text-blue-600">{index}</span>
      )}
      <span className="text-meta font-medium tracking-[-0.01em] text-ink-500">{label}</span>
    </div>
  );
}

/** 조용한 태그 (기술 라벨/분류용) */
export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-line bg-surface px-2.5 py-1 text-eyebrow font-semibold tracking-[0.02em] text-ink-600',
        className,
      )}
    >
      {children}
    </span>
  );
}
