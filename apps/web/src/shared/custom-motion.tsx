"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { m } from "framer-motion";
import type { ReactNode } from "react";

function Provider({ children }: { children: ReactNode }) {
  // reducedMotion="user" — OS의 prefers-reduced-motion 설정 시 JS 모션(진입 트랜스폼,
  // RollingNumber 롤링 등)의 transform/layout 애니메이션을 자동 비활성화한다 (WCAG 2.3.3).
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>{children}</LazyMotion>
    </MotionConfig>
  );
}

export const CustomMotion = {
  Provider,
  m,
} as const;
