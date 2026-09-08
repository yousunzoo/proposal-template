'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * mermaid 다이어그램 렌더러 (클라이언트 전용).
 * mermaid를 동적 import 하여 초기 번들에서 제외한다.
 * 렌더 실패 시 원본 코드를 코드블록으로 노출해 내용이 사라지지 않게 한다.
 */
export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);
  const idRef = useRef(`mermaid-${Math.floor(Math.random() * 1e9).toString(36)}`);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'neutral',
          fontFamily: 'inherit',
        });
        const { svg } = await mermaid.render(idRef.current, chart.trim());
        if (!cancelled) setSvg(svg);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (failed) {
    return (
      <pre className="overflow-x-auto rounded-lg border border-line bg-elevated p-4 font-mono text-meta leading-[1.6] text-ink-600">
        <code>{chart}</code>
      </pre>
    );
  }
  if (!svg) {
    return (
      <div className="rounded-xl border border-line bg-elevated/40 px-4 py-8 text-center text-meta text-ink-400">
        다이어그램 렌더링 중…
      </div>
    );
  }
  return (
    <div
      className="overflow-x-auto rounded-xl border border-line bg-surface p-5 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      // mermaid가 securityLevel:'strict'로 정화한 SVG
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
