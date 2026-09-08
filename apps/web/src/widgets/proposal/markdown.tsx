import { Fragment, type ReactNode } from 'react';
import { Reveal } from '@/widgets/proposal/reveal';
import { Mermaid } from '@/widgets/proposal/mermaid';
import { Check } from '@/shared/ui/icons';

/**
 * 제안서용 경량 마크다운 렌더러 (무의존).
 * 블록: 제목(3단계 시각 구분), 순서없는/번호 목록, 인용, 구분선, 문단.
 * 인라인: 굵게, 기울임, 굵은기울임, 코드, 취소선, 링크.
 * 모두 현재 디자인 시스템 토큰에 맞춰 렌더한다.
 */

type MdBlock =
  | { type: 'heading'; level: number; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'quote'; lines: string[] }
  | { type: 'hr' }
  | { type: 'mermaid'; code: string }
  | { type: 'code'; code: string }
  | { type: 'p'; text: string };

function parseMarkdown(src: string): MdBlock[] {
  const lines = (src ?? '').replace(/\r\n/g, '\n').split('\n');
  const blocks: MdBlock[] = [];
  let para: string[] = [];
  let ul: string[] = [];
  let ol: string[] = [];
  let quote: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ type: 'p', text: para.join(' ') });
    if (ul.length) blocks.push({ type: 'ul', items: ul });
    if (ol.length) blocks.push({ type: 'ol', items: ol });
    if (quote.length) blocks.push({ type: 'quote', lines: quote });
    para = [];
    ul = [];
    ol = [];
    quote = [];
  };

  for (let idx = 0; idx < lines.length; idx += 1) {
    const raw = lines[idx];
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    // 코드펜스 ```lang ... ``` — mermaid는 다이어그램, 그 외는 코드블록으로.
    const fence = line.match(/^(?:```|~~~)([\w-]*)$/);
    if (fence) {
      flush();
      const lang = fence[1].toLowerCase();
      const body: string[] = [];
      idx += 1;
      while (idx < lines.length && !/^(?:```|~~~)\s*$/.test(lines[idx].trim())) {
        body.push(lines[idx]);
        idx += 1;
      }
      const code = body.join('\n');
      if (code.trim())
        blocks.push(lang === 'mermaid' ? { type: 'mermaid', code } : { type: 'code', code });
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flush();
      blocks.push({ type: 'hr' });
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      flush();
      blocks.push({ type: 'heading', level: h[1].length, text: h[2].trim() });
      continue;
    }
    const q = line.match(/^>\s?(.*)$/);
    if (q) {
      if (para.length || ul.length || ol.length) flush();
      quote.push(q[1].trim());
      continue;
    }
    const u = line.match(/^[-*+]\s+(.+)$/);
    if (u) {
      if (para.length || ol.length || quote.length) flush();
      ul.push(u[1].trim());
      continue;
    }
    const o = line.match(/^\d+[.)]\s+(.+)$/);
    if (o) {
      if (para.length || ul.length || quote.length) flush();
      ol.push(o[1].trim());
      continue;
    }
    if (ul.length || ol.length || quote.length) flush();
    para.push(line);
  }
  flush();
  return blocks;
}

const INLINE_RE =
  /(`[^`]+`)|(\*\*\*[^*]+\*\*\*)|(\*\*[^*]+\*\*)|(~~[^~]+~~)|(\*[^*\s][^*]*\*)|(_[^_\s][^_]*_)|(\[[^\]]+\]\([^)]+\))/g;

/** 인라인 서식 렌더 */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text))) {
    if (m.index > last) nodes.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>);
    const tok = m[0];
    if (tok.startsWith('`')) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[0.88em] font-medium text-blue-700"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith('***')) {
      nodes.push(
        <strong key={key++} className="font-semibold italic text-ink-900">
          {tok.slice(3, -3)}
        </strong>,
      );
    } else if (tok.startsWith('**')) {
      nodes.push(
        <strong key={key++} className="font-semibold text-ink-900">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else if (tok.startsWith('~~')) {
      nodes.push(
        <span key={key++} className="text-ink-400 line-through">
          {tok.slice(2, -2)}
        </span>,
      );
    } else if (tok.startsWith('*') || tok.startsWith('_')) {
      nodes.push(
        <em key={key++} className="italic text-ink-700">
          {tok.slice(1, -1)}
        </em>,
      );
    } else if (tok.startsWith('[')) {
      const lm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (lm)
        nodes.push(
          <a
            key={key++}
            href={lm[2]}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-blue-600 underline underline-offset-2 transition-colors hover:text-blue-500"
          >
            {lm[1]}
          </a>,
        );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  return nodes;
}

/** 제목 3단계 — 크기·색·마커를 모두 달리해 시각적으로 뚜렷이 구분한다. */
function Heading({ level, text }: { level: number; text: string }) {
  // # / ## → 대제목: 굵은 블루 바 + 큰 볼드 (ink-900)
  if (level <= 2) {
    return (
      <Reveal className="mt-10 flex items-center gap-3 first:mt-0">
        <span className="h-6 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden />
        <h3 className="text-xl font-bold tracking-[-0.4px] text-ink-900 lg:text-2xl">
          {renderInline(text)}
        </h3>
      </Reveal>
    );
  }
  // ### → 소제목: 작은 블루 점 + 블루 텍스트 (중간 크기)
  if (level === 3) {
    return (
      <Reveal className="mt-7 flex items-center gap-2 first:mt-0">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden />
        <h4 className="text-body font-semibold tracking-[-0.2px] text-blue-800 lg:text-lead">
          {renderInline(text)}
        </h4>
      </Reveal>
    );
  }
  // #### 이하 → 소소제목: 작은 회색 라벨(대문자 트래킹)
  return (
    <Reveal className="mt-5 first:mt-0">
      <h5 className="text-caption font-semibold uppercase tracking-[0.1em] text-ink-500">
        {renderInline(text)}
      </h5>
    </Reveal>
  );
}

export function Markdown({ content }: { content: string }) {
  const blocks = parseMarkdown(content);
  if (!blocks.length) return null;

  return (
    <div className="flex flex-col gap-5">
      {blocks.map((b, i) => {
        if (b.type === 'heading') return <Heading key={i} level={b.level} text={b.text} />;

        if (b.type === 'hr') {
          return (
            <Reveal key={i}>
              <hr className="my-2 border-t border-line" />
            </Reveal>
          );
        }

        if (b.type === 'mermaid') {
          return (
            <Reveal key={i}>
              <Mermaid chart={b.code} />
            </Reveal>
          );
        }

        if (b.type === 'code') {
          return (
            <Reveal key={i}>
              <pre className="overflow-x-auto rounded-lg border border-line bg-elevated p-4 font-mono text-meta leading-[1.6] text-ink-700">
                <code>{b.code}</code>
              </pre>
            </Reveal>
          );
        }

        if (b.type === 'quote') {
          return (
            <Reveal key={i}>
              <blockquote className="border-l-[3px] border-blue-300 bg-blue-50/50 py-3 pl-4 pr-3 text-body italic leading-[1.75] text-ink-600 lg:text-base">
                {b.lines.map((ln, k) => (
                  <p key={k} className={k > 0 ? 'mt-2' : undefined}>
                    {renderInline(ln)}
                  </p>
                ))}
              </blockquote>
            </Reveal>
          );
        }

        if (b.type === 'ul') {
          return (
            <Reveal key={i}>
              <ul className="flex flex-col gap-3">
                {b.items.map((it, k) => (
                  <li
                    key={k}
                    className="flex items-start gap-2.5 text-body leading-[1.6] tracking-[-0.3px] text-ink-700 lg:text-base"
                  >
                    <Check width={18} height={18} aria-hidden className="mt-0.5 shrink-0 text-blue-600" />
                    <span>{renderInline(it)}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        }

        if (b.type === 'ol') {
          return (
            <Reveal key={i}>
              <ol className="flex flex-col gap-3">
                {b.items.map((it, k) => (
                  <li
                    key={k}
                    className="flex items-start gap-3 text-body leading-[1.6] tracking-[-0.3px] text-ink-700 lg:text-base"
                  >
                    <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-eyebrow font-bold tabular-nums text-blue-600">
                      {k + 1}
                    </span>
                    <span>{renderInline(it)}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          );
        }

        return (
          <Reveal key={i}>
            <p className="text-base leading-[1.8] tracking-[-0.32px] text-ink-600 lg:text-lg">
              {renderInline(b.text)}
            </p>
          </Reveal>
        );
      })}
    </div>
  );
}
