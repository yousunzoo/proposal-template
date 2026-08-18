/** 플랫폼 유형 facet — 프로젝트가 어떤 형태로 만들어졌는가 */
export type PlatformFacet = "웹" | "앱" | "플랫폼" | "관리자·CMS" | "퍼블리싱";

/** 도메인 facet — 어떤 산업/문제 영역인가 */
export type DomainFacet =
  | "금융·대출"
  | "커머스"
  | "AI·챗봇"
  | "헬스케어"
  | "공공·접근성"
  | "교육"
  | "공간·부동산"
  | "마케팅·브랜드"
  | "지도·위치";

export interface Project {
  slug: string;
  thumbnail: string;
  detail: string | null;
  title: string;
  category: string;
  period: string;
  description: string;
  keyword: string[];
  /** 플랫폼 유형 필터용 (다축 facet) */
  platform: PlatformFacet[];
  /** 도메인 필터용 (다축 facet) */
  domain: DomainFacet[];
}
