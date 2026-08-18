# 제안서 템플릿 자동 생성 시스템

제안서 원본을 입력받아 → 전문 웹 템플릿으로 생성 → 편집 → 발행하면 고유 URL(`/p/[slug]`)로 공개되는 Next.js 풀스택 앱.

## 구조

```
apps/web         Next.js 15 (App Router, React 19, Tailwind 4)
                 · 공개 화면 /p/[slug], 포트폴리오 상세
                 · 관리 화면 /(대시보드), /proposals/[id]/edit, /preview  (미들웨어 보호)
                 · API route handlers /api/proposals/*  (Prisma → Postgres)
packages/shared  공유 DTO 타입
```

> 초기 버전의 별도 Nest.js API(`apps/api`)는 Next.js route handler로 통합되어 제거되었습니다.

## 개발

```bash
pnpm install
# apps/web/.env.local 에 DATABASE_URL / DIRECT_URL / AUTH_SECRET / ADMIN_PASSWORD 설정
pnpm db:push         # Postgres 스키마 동기화 (최초 1회 / 스키마 변경 시)
pnpm dev             # web(:3000)
```

## 인증

- 관리 화면·API는 단일 관리자 비밀번호(`ADMIN_PASSWORD`) 로그인 후 httpOnly 세션 쿠키로 보호됩니다.
- 공개 페이지(`/p/[slug]`)와 공개 API(`/api/proposals/public/[slug]`)만 무인증 접근 가능합니다.

## 플로우

1. `/` — 프로젝트 정보 + 제안서 원본 + 포트폴리오 입력 → 생성
2. `/proposals/[id]/edit` — 파싱된 섹션 편집 → 배포
3. `/p/[slug]` — 발행된 공개 제안서 (사이드바 스크롤 네비 + 관련 포트폴리오)

## 배포

Vercel + Neon(Postgres) 배포 절차는 [`docs/DEPLOY.md`](docs/DEPLOY.md) 참고.
