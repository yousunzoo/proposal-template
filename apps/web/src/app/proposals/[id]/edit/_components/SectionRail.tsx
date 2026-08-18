'use client';

import type { ProjectInfo, ProposalSectionsData, SectionId } from '@proposal/shared';
import { SECTION_LABELS, SECTION_ORDER } from '@proposal/shared';
import { Reorder, useDragControls } from 'framer-motion';
import { cn } from '@/lib/cn';
import { isSectionFilled, isProjectInfoFilled } from '../_lib/completeness';
import { Grip, Eye, EyeOff } from './icons';

type Doc = ProposalSectionsData;

/** 완성도 점 */
function Dot({ filled }: { filled: boolean }) {
  return (
    <span
      aria-hidden
      className={cn('h-1.5 w-1.5 shrink-0 rounded-full', filled ? 'bg-blue-500' : 'bg-line-strong')}
      title={filled ? '작성됨' : '비어 있음'}
    />
  );
}

/** 상단 고정 항목(프로젝트 정보) */
function PinnedRow({
  label,
  filled,
  active,
  onSelect,
}: {
  label: string;
  filled: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors',
        active ? 'bg-blue-50 font-semibold text-blue-700' : 'text-ink-700 hover:bg-elevated',
      )}
    >
      <span className="w-[15px]" />
      <Dot filled={filled} />
      <span className="flex-1 truncate">{label}</span>
    </button>
  );
}

/** 드래그 가능한 섹션 행 */
function SectionRow({
  id,
  visible,
  filled,
  active,
  onSelect,
  onToggleVisible,
}: {
  id: SectionId;
  visible: boolean;
  filled: boolean;
  active: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      className={cn(
        'group flex list-none items-center gap-1 rounded-lg px-1.5 py-1.5 transition-colors',
        active ? 'bg-blue-50' : 'hover:bg-elevated',
      )}
    >
      <button
        type="button"
        aria-label="드래그로 순서 변경"
        onPointerDown={(e) => controls.start(e)}
        className="flex h-6 w-5 shrink-0 cursor-grab touch-none items-center justify-center text-ink-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <Grip width={14} height={14} />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <Dot filled={filled && visible} />
        <span
          className={cn(
            'flex-1 truncate text-[13px]',
            active ? 'font-semibold text-blue-700' : visible ? 'text-ink-700' : 'text-ink-400 line-through',
          )}
        >
          {SECTION_LABELS[id]}
        </span>
      </button>
      <button
        type="button"
        onClick={onToggleVisible}
        title={visible ? '숨기기' : '표시하기'}
        aria-label={visible ? '숨기기' : '표시하기'}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors',
          visible ? 'text-ink-400 hover:text-ink-700' : 'text-ink-300 hover:text-ink-600',
        )}
      >
        {visible ? <Eye width={15} height={15} /> : <EyeOff width={15} height={15} />}
      </button>
    </Reorder.Item>
  );
}

export function SectionRail({
  doc,
  update,
  title,
  info,
  activeKey,
  onSelect,
}: {
  doc: Doc;
  update: (fn: (d: Doc) => void) => void;
  title: string;
  info: ProjectInfo;
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  const layout = doc.layout?.length ? doc.layout : SECTION_ORDER.map((id) => ({ id, visible: true }));
  const ids = layout.map((l) => l.id);
  const visibleCount = layout.filter((l) => l.visible).length;

  const reorder = (newIds: SectionId[]) => {
    update((d) => {
      const byId = new Map(d.layout.map((l) => [l.id, l] as const));
      d.layout = newIds.map((id) => byId.get(id)!).filter(Boolean);
    });
  };
  const toggleVisible = (id: SectionId) => {
    update((d) => {
      const it = d.layout.find((x) => x.id === id);
      if (it) it.visible = !it.visible;
    });
  };

  return (
    <nav className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 pb-2 pt-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">섹션</span>
        <span className="text-[11px] text-ink-400">{visibleCount}/{layout.length} 표시</span>
      </div>

      <div className="px-2">
        <PinnedRow
          label="프로젝트 정보"
          filled={isProjectInfoFilled(title, info)}
          active={activeKey === 'project'}
          onSelect={() => onSelect('project')}
        />
      </div>

      <div className="mx-3 my-2 border-t border-line" />

      <Reorder.Group
        axis="y"
        values={ids}
        onReorder={reorder}
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-4"
      >
        {layout.map((item) => (
          <SectionRow
            key={item.id}
            id={item.id}
            visible={item.visible}
            filled={isSectionFilled(doc, item.id)}
            active={activeKey === item.id}
            onSelect={() => onSelect(item.id)}
            onToggleVisible={() => toggleVisible(item.id)}
          />
        ))}
      </Reorder.Group>
    </nav>
  );
}
