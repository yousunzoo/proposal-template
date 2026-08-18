'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Label, TextInput, TextArea } from '@/components/ui';
import { keyOf } from '../_lib/keys';
import { Grip, Plus, Trash, Copy } from './icons';

/** 라벨 + 컨트롤 */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5">{label}</Label>
      {hint && <p className="mb-1.5 text-[12px] text-ink-500">{hint}</p>}
      {children}
    </div>
  );
}

/** 서브 그룹 헤더 */
export function Sub({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-6 border-t border-line pt-5">
      <p className="mb-3 text-[13px] font-semibold text-ink-700">{label}</p>
      {children}
    </div>
  );
}

/**
 * 단순 문자열 리스트를 한 줄=한 항목으로 편집하는 textarea.
 * 항목 추가/삭제/재정렬을 카드로 하지 않고 Enter(줄바꿈)로 처리한다.
 * 편집 중엔 로컬 상태로 자유롭게 입력하고, blur 시 빈 줄을 정리해 커밋한다.
 */
export function LineListField({
  label,
  hint,
  value,
  onCommit,
  placeholder,
  rows = 5,
  className,
}: {
  label: string;
  hint?: string;
  value: string[];
  onCommit: (next: string[]) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  const [text, setText] = useState(() => value.join('\n'));
  // 외부에서 값이 바뀌면(예: AI 정제) 동기화. 입력 중엔 부모가 재렌더되지 않아 안전.
  useEffect(() => {
    setText(value.join('\n'));
  }, [value]);

  const commit = () => {
    const next = text.split('\n').map((s) => s.trim()).filter(Boolean);
    setText(next.join('\n'));
    onCommit(next);
  };

  return (
    <Field label={label} hint={hint} className={className}>
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        placeholder={placeholder}
        style={{ height: `${rows * 1.7 + 1.5}rem` }}
      />
    </Field>
  );
}

export function TitleField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="섹션 제목" hint="공개 제안서에 노출되는 섹션 헤드라인입니다.">
      <TextInput value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

/** 소형 아이콘 버튼 */
export function IconBtn({
  children,
  onClick,
  disabled,
  danger,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-ink-500 transition-colors disabled:opacity-30',
        danger
          ? 'hover:border-red-300 hover:bg-red-50 hover:text-red-600'
          : 'hover:border-line-strong hover:text-ink-900',
      )}
    >
      {children}
    </button>
  );
}

/** 리스트 항목 카드의 공통 헤더(번호 + 복제/삭제) */
function RowActions({
  index,
  onDuplicate,
  onDelete,
  handle,
}: {
  index: number;
  onDuplicate?: () => void;
  onDelete: () => void;
  handle?: ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        {handle}
        <span className="text-[11px] font-semibold tabular-nums text-ink-500">#{index + 1}</span>
      </div>
      <div className="flex gap-1">
        {onDuplicate && (
          <IconBtn onClick={onDuplicate} title="복제">
            <Copy width={13} height={13} />
          </IconBtn>
        )}
        <IconBtn onClick={onDelete} danger title="삭제">
          <Trash width={13} height={13} />
        </IconBtn>
      </div>
    </div>
  );
}

const CARD = 'rounded-xl border border-line bg-elevated p-3.5';

/** 드래그 가능한 객체 항목 행 (핸들 전용 드래그) */
function DraggableRow<T>({
  item,
  index,
  onDuplicate,
  onDelete,
  render,
}: {
  item: T;
  index: number;
  onDuplicate: () => void;
  onDelete: () => void;
  render: (item: T, index: number) => ReactNode;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={keyOf(item, index)}
      dragListener={false}
      dragControls={controls}
      className={cn(CARD, 'list-none')}
    >
      <RowActions
        index={index}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        handle={
          <button
            type="button"
            aria-label="드래그로 순서 변경"
            onPointerDown={(e) => controls.start(e)}
            className="flex h-7 w-6 cursor-grab touch-none items-center justify-center rounded-md text-ink-400 hover:text-ink-700 active:cursor-grabbing"
          >
            <Grip width={15} height={15} />
          </button>
        }
      />
      {render(item, index)}
    </Reorder.Item>
  );
}

const ADD_BTN =
  'flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2.5 text-[13px] font-medium text-ink-500 transition-colors hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700';

/**
 * 리스트 항목 추가/복제/삭제/순서변경 래퍼.
 * - 객체 항목: 드래그 핸들로 재정렬(framer Reorder, `_k` 키).
 * - 문자열 항목: ↑↓ 버튼으로 재정렬.
 */
export function RepeatList<T>({
  items,
  onChange,
  factory,
  addLabel,
  render,
  extraAdd,
  emptyHint,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  factory: () => T;
  addLabel: string;
  render: (item: T, index: number) => ReactNode;
  extraAdd?: { label: string; factory: () => T };
  emptyHint?: string;
}) {
  const draggable =
    items.length > 0 && items.every((it) => typeof it === 'object' && it !== null);

  const duplicate = (i: number) => {
    const clone = structuredClone(items[i]);
    if (clone && typeof clone === 'object') {
      // 복제본은 새 키를 받아야 별개 항목으로 식별된다.
      delete (clone as Record<string, unknown>)._k;
    }
    const next = [...items];
    next.splice(i + 1, 0, clone);
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, k) => k !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const addRow = (
    <div className="flex gap-2">
      <button type="button" onClick={() => onChange([...items, factory()])} className={ADD_BTN}>
        <Plus width={15} height={15} /> {addLabel}
      </button>
      {extraAdd && (
        <button
          type="button"
          onClick={() => onChange([...items, extraAdd.factory()])}
          className={ADD_BTN}
        >
          <Plus width={15} height={15} /> {extraAdd.label}
        </button>
      )}
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-2.5">
        {emptyHint && (
          <p className="rounded-xl border border-dashed border-line bg-elevated px-4 py-6 text-center text-[13px] text-ink-500">
            {emptyHint}
          </p>
        )}
        {addRow}
      </div>
    );
  }

  if (draggable) {
    const keys = items.map((it, i) => keyOf(it, i));
    const reorder = (newKeys: string[]) => {
      const byKey = new Map(items.map((it, i) => [keyOf(it, i), it] as const));
      onChange(newKeys.map((k) => byKey.get(k)!).filter(Boolean) as T[]);
    };
    return (
      <div className="flex flex-col gap-2.5">
        <Reorder.Group axis="y" values={keys} onReorder={reorder} className="flex flex-col gap-2.5">
          {items.map((item, i) => (
            <DraggableRow
              key={keyOf(item, i)}
              item={item}
              index={i}
              onDuplicate={() => duplicate(i)}
              onDelete={() => remove(i)}
              render={render}
            />
          ))}
        </Reorder.Group>
        {addRow}
      </div>
    );
  }

  // 문자열 리스트 — ↑↓ 재정렬
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <div key={i} className={CARD}>
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold tabular-nums text-ink-500">#{i + 1}</span>
            <div className="flex gap-1">
              <IconBtn onClick={() => move(i, -1)} disabled={i === 0} title="위로">↑</IconBtn>
              <IconBtn onClick={() => move(i, 1)} disabled={i === items.length - 1} title="아래로">↓</IconBtn>
              <IconBtn onClick={() => remove(i)} danger title="삭제">
                <Trash width={13} height={13} />
              </IconBtn>
            </div>
          </div>
          {render(item, i)}
        </div>
      ))}
      {addRow}
    </div>
  );
}
