'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export interface NavItem {
  id: string;
  label: string;
}

/** 좌측 고정 사이드바 + 스크롤 스파이. 모바일에서는 상단 가로 탭으로 전환. */
export function SidebarNav({ items, title }: { items: NavItem[]; title: string }) {
  const [active, setActive] = useState(items[0]?.id ?? '');

  useEffect(() => {
    const sections = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  function handleClick(e: React.MouseEvent, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(id);
      history.replaceState(null, '', `#${id}`);
    }
  }

  return (
    <>
      {/* 데스크톱: 좌측 고정 */}
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-[248px] flex-col border-r border-line bg-surface/90 backdrop-blur-xl lg:flex">
        <div className="border-b border-line px-6 py-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">제안서</p>
          <p className="mt-2.5 line-clamp-3 text-[15px] font-bold leading-[1.4] tracking-[-0.3px] text-ink-900">
            {title}
          </p>
        </div>
        <nav aria-label="제안서 섹션" className="flex-1 overflow-y-auto px-4 py-5">
          <ul className="flex flex-col gap-0.5">
            {items.map((it) => {
              const on = active === it.id;
              return (
                <li key={it.id}>
                  <a
                    href={`#${it.id}`}
                    onClick={(e) => handleClick(e, it.id)}
                    aria-current={on ? 'true' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
                      on
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-ink-500 hover:bg-elevated hover:text-ink-900',
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                        on ? 'bg-blue-600' : 'bg-line-strong',
                      )}
                    />
                    {it.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* 모바일: 상단 가로 스크롤 탭 */}
      <div className="relative sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur-xl lg:hidden">
        <nav aria-label="제안서 섹션" className="flex gap-1 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it) => (
            <a
              key={it.id}
              href={`#${it.id}`}
              onClick={(e) => handleClick(e, it.id)}
              aria-current={active === it.id ? 'true' : undefined}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
                active === it.id
                  ? 'bg-blue-700 text-white'
                  : 'bg-elevated text-ink-600',
              )}
            >
              {it.label}
            </a>
          ))}
        </nav>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-surface to-transparent"
        />
      </div>
    </>
  );
}
