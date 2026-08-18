import type { ContentBlock } from '@proposal/shared';
import { Reveal } from '@/components/proposal/reveal';
import { Check } from '@/shared/icons';

/** 프로젝트 분석 콘텐츠 블록 1개 렌더 (clickb ContentBlockView 패턴) */
export function ContentBlockView({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case 'heading':
      return (
        <Reveal className="mt-8 flex items-center gap-3 first:mt-0">
          <span className="h-5 w-1 shrink-0 rounded-full bg-blue-500" aria-hidden />
          <h3 className="text-lg font-semibold tracking-[-0.4px] text-ink-900 lg:text-xl">
            {block.text}
          </h3>
        </Reveal>
      );
    case 'list':
      return (
        <Reveal>
          <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {block.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-[15px] leading-[1.6] tracking-[-0.3px] text-ink-700 lg:text-base"
              >
                <Check width={18} height={18} aria-hidden className="mt-0.5 shrink-0 text-blue-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      );
    case 'feature':
      return (
        <Reveal className="flex gap-4 rounded-[10px] border border-line bg-surface p-5 lg:gap-5 lg:p-6">
          <span className="text-lg font-semibold tabular-nums text-blue-600 lg:text-xl">
            {block.index}
          </span>
          <div className="flex flex-col gap-2">
            <h4 className="text-base font-semibold tracking-[-0.32px] text-ink-900 lg:text-lg">
              {block.title}
            </h4>
            {block.body && (
              <p className="text-[15px] leading-[1.75] tracking-[-0.3px] text-ink-600 lg:text-base">
                {block.body}
              </p>
            )}
          </div>
        </Reveal>
      );
    default:
      return (
        <Reveal>
          <p className="text-base leading-[1.8] tracking-[-0.32px] text-ink-600 lg:text-lg">
            {block.text}
          </p>
        </Reveal>
      );
  }
}
