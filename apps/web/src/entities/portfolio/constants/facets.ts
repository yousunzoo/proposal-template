import type { DomainFacet, PlatformFacet } from "../type";

/**
 * 필터 facet 단일 진실 원천.
 * 배열 순서가 필터 바 노출 순서를 결정한다.
 */

/** 플랫폼 유형 축 — "어떤 형태로 만들었는가" */
export const PLATFORM_FACETS = [
  "웹",
  "앱",
  "플랫폼",
  "관리자·CMS",
  "퍼블리싱",
] as const satisfies readonly PlatformFacet[];

/** 도메인 축 — "어떤 산업/문제 영역인가" */
export const DOMAIN_FACETS = [
  "금융·대출",
  "커머스",
  "AI·챗봇",
  "헬스케어",
  "공공·접근성",
  "교육",
  "공간·부동산",
  "마케팅·브랜드",
  "지도·위치",
] as const satisfies readonly DomainFacet[];
