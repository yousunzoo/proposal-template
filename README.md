# 제안서 템플릿 자동 생성 시스템

제안서 원본을 입력받아 → 전문 웹 템플릿으로 생성 → 편집 → 발행하면 고유 URL(`/p/[slug]`)로 공개되는 Next.js 풀스택 앱.

## 현재 방향

이 프로젝트는 포트폴리오 기반 제안서 생성을 위한 독립 제품 프로토타입으로 유지한다.
기존 이관 계획은 과거 검토 문서로 보존하며, 현재 제품화 로드맵은
[`docs/productization-roadmap.md`](docs/productization-roadmap.md)를 기준으로 한다.

제품화의 1차 원칙은 기본 데이터와 샘플에서 실명, 고객사명, 운영 지표, URL, 환경값 등 민감정보를 제거하면서도
포트폴리오 추천, 제안서 구조화, 공개 링크, PDF 산출 기능을 유지·고도화하는 것이다.

## 구조

```
apps/web         Next.js 15 (App Router, React 19, Tailwind 4)
                 · 공개 화면 /p/[slug], 포트폴리오 상세
                 · 작성 화면 /(홈), /proposals/[id]/edit, /preview
                 · API route handlers /api/proposals/*  (Prisma → Postgres)
packages/shared  공유 DTO 타입
```

> 초기 버전의 별도 Nest.js API(`apps/api`)는 Next.js route handler로 통합되어 제거되었습니다.

## 개발

```bash
pnpm install
# apps/web/.env.local 에 DATABASE_URL / DIRECT_URL 설정 (OPENAI_API_KEY 는 선택)
pnpm db:push         # Postgres 스키마 동기화 (최초 1회 / 스키마 변경 시)
pnpm dev             # web(:3000)
```

## 민감정보 점검

```bash
pnpm sensitive:scan
```

기본 스캔은 `apps/web/src`, `apps/web/public`, `packages/shared/src`, 주요 제품 문서를 대상으로
API key, 이메일, 휴대폰 번호, 외부 URL, 포트폴리오 전용 public asset 참조를 검사한다.
추가로 특정 고객사명이나 개인명을 검사해야 하면 `SENSITIVE_TERMS="용어1,용어2" pnpm sensitive:scan` 형태로 실행한다.

## 접근 권한

- 이 프로토타입은 누구나 자유롭게 시험해볼 수 있도록 로그인/인증 없이 동작합니다.
  작성·편집·발행·삭제 화면과 API 모두 무인증으로 열려 있으므로, 공개 배포 시 실제 데이터를 입력하지 마세요.
- 실서비스로 전환할 때는 작성 계열 화면(`/`, `/proposals/*`)과 관리 API에 인증 계층을 다시 추가해야 합니다.

## 플로우

1. `/` — 프로젝트 정보 + 제안서 원본 + 포트폴리오 입력 → 생성
2. `/proposals/[id]/edit` — 파싱된 섹션 편집 → 배포
3. `/p/[slug]` — 발행된 공개 제안서 (사이드바 스크롤 네비 + 관련 포트폴리오)

## 배포

Vercel + Neon(Postgres) 배포 절차는 [`docs/DEPLOY.md`](docs/DEPLOY.md) 참고.
