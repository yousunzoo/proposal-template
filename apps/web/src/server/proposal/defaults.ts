/**
 * 기본 시드는 @proposal/shared에서 단일 관리한다. (파서/정규화 공용)
 * 이 파일은 하위 호환을 위한 re-export.
 */
export {
  DEFAULT_ABOUT_INTRO,
  DEFAULT_ABOUT_VALUES,
  DEFAULT_STRATEGY,
  DEFAULT_ARCH_NOTE,
  DEFAULT_ARCH_LAYERS,
  DEFAULT_QA,
  DEFAULT_WARRANTY_INCLUDED,
  DEFAULT_WARRANTY_EXCLUDED,
  DEFAULT_WARRANTY_HANDOFF,
  buildDefaultTimeline,
} from '@proposal/shared';
