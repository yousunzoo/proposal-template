export { PLATFORM_FACETS, DOMAIN_FACETS } from "./facets";

import type { Project } from "../type";

/**
 * 데모용 샘플 포트폴리오 라이브러리.
 *
 * 여기 담긴 사례는 모두 실제 고객/프로젝트와 무관한 가상의 예시다.
 * 프로토타입을 시험해보는 사람이 추천·필터·상세 흐름을 확인할 수 있도록
 * 도메인·플랫폼 facet을 골고루 덮는 것을 목적으로 구성했다.
 */

const SAMPLE_IMAGE = "/images/blur/loading-blur.png";

const createCase = (project: Omit<Project, "thumbnail" | "detail" | "visibility">): Project => ({
  ...project,
  thumbnail: SAMPLE_IMAGE,
  detail: null,
  visibility: "public-sample",
});

export const personalFinanceDashboard = createCase({
  slug: "personal-finance-dashboard",
  title: "가계 자산 관리 대시보드 (샘플)",
  category: "WEB, APP, Dashboard",
  period: "샘플 기간",
  description: `[프로젝트 개요]

여러 계좌와 카드 사용 내역을 한 화면에서 확인하고 월별 지출을 분류해 보여주는 개인 자산 관리 대시보드를 만든 가상 예시입니다. 숫자를 나열하는 대신 사용자가 지금 무엇을 확인해야 하는지 먼저 보이도록 정보 위계를 정리했습니다.

[담당 업무]

- 지출 분류와 예산 현황 대시보드 UX 설계
- 계좌·카드·예산 데이터 구조 설계
- 차트와 요약 카드 컴포넌트 구현
- 기간 필터와 카테고리 드릴다운 구현

[프로젝트 주안점]

1. 판단을 돕는 요약 우선 구조
많은 지표를 한 번에 보여주기보다, 이번 달 예산 대비 상태를 먼저 보여줘 다음 행동을 유도했습니다.

2. 확장 가능한 지표 구성
카테고리와 예산 규칙을 데이터로 분리해 지표 추가와 변경에 대응했습니다.`,
  keyword: ["대시보드", "자산 관리", "데이터 시각화"],
  platform: ["웹", "앱"],
  domain: ["금융·대출"],
});

export const subscriptionCommerceConsole = createCase({
  slug: "subscription-commerce-console",
  title: "구독형 정기배송 커머스 운영 콘솔 (샘플)",
  category: "Commerce, Admin",
  period: "샘플 기간",
  description: `[프로젝트 개요]

정기배송 상품의 주문, 배송 주기, 결제 실패, 해지 방어를 운영자가 한곳에서 관리하는 커머스 운영 콘솔을 만든 가상 예시입니다. 사용자 구독 화면과 운영 콘솔을 분리하되 구독 상태 데이터는 하나의 기준으로 관리했습니다.

[담당 업무]

- 구독 상태와 배송 주기 데이터 구조 설계
- 운영자용 구독·결제·해지 관리 화면 구현
- 결제 실패 재시도와 알림 흐름 구현
- 구독 지표 요약 화면 구성

[프로젝트 주안점]

1. 상태 중심의 운영 화면
구독을 단순 목록이 아니라 진행·실패·해지 예정 같은 상태로 나눠 운영자가 처리할 일을 먼저 보게 했습니다.

2. 반복 업무의 자동화
결제 실패 재시도와 알림을 규칙으로 처리해 수기 대응을 줄였습니다.`,
  keyword: ["구독 커머스", "운영 콘솔", "결제 관리"],
  platform: ["웹", "관리자·CMS"],
  domain: ["커머스"],
});

export const internalKnowledgeAssistant = createCase({
  slug: "internal-knowledge-assistant",
  title: "사내 지식 검색 AI 어시스턴트 (샘플)",
  category: "WEB, AI",
  period: "샘플 기간",
  description: `[프로젝트 개요]

흩어진 사내 문서를 자연어로 검색하고, 근거 문서를 함께 보여주는 AI 어시스턴트를 만든 가상 예시입니다. 답변만 던지지 않고 어떤 문서에서 나온 내용인지 확인할 수 있게 해 신뢰도를 높였습니다.

[담당 업무]

- 질문·답변·근거 문서 UX 설계
- 검색 결과와 인용 출처 표시 화면 구현
- 대화 이력과 즐겨찾기 관리 기능 구현
- 응답 신뢰도 표시와 피드백 수집 기능 구현

[프로젝트 주안점]

1. 근거를 함께 보여주는 답변
답변 옆에 출처 문서를 연결해 사용자가 사실 여부를 직접 확인하도록 했습니다.

2. 피드백으로 개선되는 구조
도움이 된 답변과 아닌 답변을 수집해 응답 기준을 다듬을 수 있게 했습니다.`,
  keyword: ["AI 검색", "지식 관리", "출처 표시"],
  platform: ["웹"],
  domain: ["AI·챗봇"],
});

export const telehealthBookingApp = createCase({
  slug: "telehealth-booking-app",
  title: "원격 건강 상담 예약 앱 (샘플)",
  category: "APP, Booking",
  period: "샘플 기간",
  description: `[프로젝트 개요]

증상과 가능한 시간대를 기준으로 상담사를 찾아 예약하고, 상담 이력을 관리하는 원격 건강 상담 앱을 만든 가상 예시입니다. 예약 전 확인 정보와 상담 후 안내가 끊기지 않도록 흐름을 설계했습니다.

[담당 업무]

- 증상·시간 기반 상담사 탐색 흐름 설계
- 예약·변경·취소와 알림 기능 구현
- 상담 이력과 후속 안내 화면 구현
- 모바일 접근성과 예외 상태 처리

[프로젝트 주안점]

1. 예약 전 확인을 돕는 정보 배치
상담 대상, 비용, 소요 시간을 먼저 보여줘 불필요한 문의와 취소를 줄였습니다.

2. 상담 이후까지 이어지는 흐름
예약 완료, 준비 안내, 상담 이력을 하나의 흐름으로 연결했습니다.`,
  keyword: ["예약", "헬스케어", "모바일 앱"],
  platform: ["앱"],
  domain: ["헬스케어"],
});

export const civicAccessibilityRenewal = createCase({
  slug: "civic-accessibility-renewal",
  title: "공공 민원 안내 접근성 개선 (샘플)",
  category: "WEB, Accessibility",
  period: "샘플 기간",
  description: `[프로젝트 개요]

공공 민원 안내 페이지를 접근성 기준에 맞춰 점검하고 주요 화면을 개선한 가상 예시입니다. 정보 구조, 키보드 이동, 대체 텍스트, 명도 대비를 중심으로 누구나 이용할 수 있도록 정리했습니다.

[담당 업무]

- 주요 안내 화면 접근성 진단
- 시맨틱 마크업과 컴포넌트 구조 개선
- 키보드 탐색과 포커스 상태 정리
- 접근성 점검 체크리스트 작성

[프로젝트 주안점]

1. 구조부터 바로잡은 개선
시각 보정이 아니라 마크업과 상호작용 구조를 함께 정리했습니다.

2. 재사용 가능한 점검 체계
후속 화면에도 적용할 수 있는 체크리스트를 남겼습니다.`,
  keyword: ["접근성", "공공 서비스", "QA"],
  platform: ["웹", "퍼블리싱"],
  domain: ["공공·접근성"],
});

export const onlineCourseLms = createCase({
  slug: "online-course-lms",
  title: "온라인 강의 LMS (샘플)",
  category: "WEB, LMS",
  period: "샘플 기간",
  description: `[프로젝트 개요]

강의 수강, 과제 제출, 진도 확인, 수강생 관리를 제공하는 온라인 학습 시스템을 만든 가상 예시입니다. 수강생 화면과 운영자 화면을 분리하고 콘텐츠 운영 흐름을 정리했습니다.

[담당 업무]

- 강의·과제·진도 데이터 구조 설계
- 수강생 대시보드와 운영자 화면 구현
- 콘텐츠 등록과 노출 관리 기능 구현
- 학습 상태와 운영 통계 화면 구성

[프로젝트 주안점]

1. 학습 흐름과 운영 흐름의 분리
수강생은 다음 학습을 쉽게 찾고, 운영자는 콘텐츠와 진도를 관리하도록 했습니다.

2. 확장 가능한 콘텐츠 구조
강의 유형과 운영 정책 변경에 대응할 수 있게 데이터를 구성했습니다.`,
  keyword: ["LMS", "온라인 교육", "운영 관리"],
  platform: ["웹", "관리자·CMS"],
  domain: ["교육"],
});

export const coworkingReservation = createCase({
  slug: "coworking-reservation",
  title: "공유 오피스 예약 플랫폼 (샘플)",
  category: "WEB, APP, Platform",
  period: "샘플 기간",
  description: `[프로젝트 개요]

회의실과 좌석을 검색해 예약하고, 정원과 이용 시간을 관리하는 공유 오피스 예약 플랫폼을 만든 가상 예시입니다. 이용자 예약 흐름과 운영자 승인·현황 관리를 함께 설계했습니다.

[담당 업무]

- 공간 탐색과 예약 흐름 설계
- 정원·시간·중복 예약 관리 기능 구현
- 위치·유형 기반 검색 UI 구성
- 운영자 승인과 이용 현황 화면 구현

[프로젝트 주안점]

1. 탐색에서 예약까지 이어지는 흐름
조건에 맞는 공간을 빠르게 찾아 예약까지 이어지도록 설계했습니다.

2. 정원과 중복 예약 관리
동시 예약 충돌을 막고 이용 현황을 운영자가 추적할 수 있게 했습니다.`,
  keyword: ["예약", "공간 플랫폼", "정원 관리"],
  platform: ["웹", "앱", "플랫폼"],
  domain: ["공간·부동산"],
});

export const brandCampaignSite = createCase({
  slug: "brand-campaign-site",
  title: "브랜드 캠페인 랜딩 퍼블리싱 (샘플)",
  category: "Publishing, SEO",
  period: "샘플 기간",
  description: `[프로젝트 개요]

브랜드 캠페인과 상품 정보를 전달하는 반응형 랜딩 페이지를 만든 가상 예시입니다. 콘텐츠 가독성, 모바일 최적화, 검색 노출을 고려해 퍼블리싱 구조를 정리했습니다.

[담당 업무]

- 반응형 랜딩 화면 설계와 구현
- 콘텐츠 구조와 SEO 기본 요소 정리
- 공통 섹션 컴포넌트 구현
- 배포 전 QA 진행

[프로젝트 주안점]

1. 읽기 쉬운 콘텐츠 구조
정보가 많아도 핵심 메시지를 빠르게 파악하도록 구성했습니다.

2. 교체하기 쉬운 섹션 설계
캠페인과 상품 변경에 맞춰 콘텐츠를 쉽게 바꿀 수 있게 했습니다.`,
  keyword: ["퍼블리싱", "SEO", "반응형 웹"],
  platform: ["웹", "퍼블리싱"],
  domain: ["마케팅·브랜드"],
});

export const petFriendlyMap = createCase({
  slug: "pet-friendly-map",
  title: "반려동물 편의시설 지도 서비스 (샘플)",
  category: "WEB, APP, Map",
  period: "샘플 기간",
  description: `[프로젝트 개요]

반려동물과 함께 갈 수 있는 장소를 지도에서 찾고, 조건별로 필터링해 상세 정보를 확인하는 지도 기반 서비스를 만든 가상 예시입니다. 목록과 지도, 상세 화면을 함께 탐색할 수 있도록 인터랙션을 설계했습니다.

[담당 업무]

- 지도와 목록을 결합한 탐색 UX 설계
- 위치·조건 기반 검색과 필터 구현
- 상세 정보 화면과 즐겨찾기 흐름 구성
- 장소 데이터 관리 화면 구현

[프로젝트 주안점]

1. 지도와 목록의 동기화
조건을 바꾸면 결과 변화를 즉시 이해할 수 있게 구성했습니다.

2. 운영 가능한 장소 데이터 관리
등록·수정·노출 상태를 관리해 데이터 품질을 유지했습니다.`,
  keyword: ["지도", "위치 검색", "필터"],
  platform: ["웹", "앱"],
  domain: ["지도·위치"],
});

/** 포트폴리오 전체 목록 (표시 순서) */
export const PROJECTS: readonly Project[] = [
  personalFinanceDashboard,
  subscriptionCommerceConsole,
  internalKnowledgeAssistant,
  telehealthBookingApp,
  civicAccessibilityRenewal,
  onlineCourseLms,
  coworkingReservation,
  brandCampaignSite,
  petFriendlyMap,
];
