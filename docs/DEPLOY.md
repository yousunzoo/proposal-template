# 배포 가이드 — Vercel + Neon(Postgres) + Prisma

이 프로젝트는 **Next.js 단일 앱(`apps/web`)**으로 배포한다.
기존 NestJS API(`apps/api`)는 `apps/web`의 route handler로 흡수되어 **더 이상 배포·구동하지 않는다(레거시)**.

```
Vercel (Root Directory = apps/web)
  └ Next.js
      · 공개 페이지  /p/[slug], /p/[slug]/portfolio/[...]
      · 작성 페이지  /(홈), /proposals/[id]/edit, /preview   ← 프로토타입: 인증 없음
      · route handlers  /api/proposals/*  (공개=/api/proposals/public/[slug])
      └ Prisma ─▶ Neon Postgres
```

> ⚠️ 이 프로토타입은 로그인/인증이 제거되어 있어 작성·발행 화면이 모두 공개된다.
> 공개 배포 시 실제 데이터를 입력하지 말고, 실서비스 전환 시 인증 계층을 다시 추가할 것.

---

## 1. Neon 데이터베이스 생성

1. https://neon.tech 프로젝트 생성(리전은 Vercel 배포 리전과 가깝게).
2. **두 개의 연결 문자열**을 복사한다:
   - **Pooled connection** (호스트에 `-pooler` 포함) → `DATABASE_URL` (앱 런타임)
   - **Direct connection** (`-pooler` 없음) → `DIRECT_URL` (마이그레이션/DDL)
   - 둘 다 끝에 `?sslmode=require` 유지.

## 2. 스키마를 DB에 반영(테이블 생성)

로컬에서 `apps/web/.env.local`에 위 두 URL을 채운 뒤:

```bash
pnpm --filter web exec prisma db push
```

- `Proposal` 테이블이 Neon에 생성된다(마이그레이션 히스토리 없이 스키마 동기화).
- 이력 관리가 필요하면 대신 `prisma migrate dev`(로컬) → `prisma migrate deploy`(배포) 흐름 사용.
- 기존 로컬 SQLite(`apps/api/prisma/dev.db`) 데이터는 자동 이전되지 않는다(개발 데이터는 로컬 전용).

## 3. 시크릿 준비

- `OPENAI_API_KEY`: (선택) 없으면 결정론 파서로 폴백.
- 별도의 인증 시크릿은 필요 없다(프로토타입은 로그인 없이 동작).

## 4. 로컬 검증

```bash
pnpm --filter web dev      # http://localhost:3000
```
- `/`(홈)에서 바로 제안서 생성 → 편집 → 배포 → `/p/[slug]` 공개 링크 확인.

## 5. Vercel 배포

1. Vercel에서 이 저장소를 **Import**.
2. **Root Directory = `apps/web`** 로 설정(중요 — 모노레포).
   - Framework Preset: **Next.js** (자동 감지).
   - Install/Build Command: 기본값 사용.
     - Build는 `apps/web/package.json`의 `prisma generate && next build`가 실행됨.
     - `pnpm install`이 워크스페이스 루트에서 돌며 `@proposal/shared`의 `prepare`가 `dist`를 빌드함.
3. **Environment Variables** 등록(Production/Preview):

   | Key | 값 |
   |-----|-----|
   | `DATABASE_URL` | Neon **pooled** 연결 문자열 |
   | `DIRECT_URL` | Neon **direct** 연결 문자열 |
   | `OPENAI_API_KEY` | (선택) OpenAI 키 |
   | `OPENAI_MODEL` | (선택) 예: `gpt-5` |
   | `WEB_ORIGIN` | (선택) 배포 도메인. 미설정 시 요청 origin 사용 |

4. **Deploy**. 완료 후 `https://<앱>.vercel.app/` → 홈에서 제안서 생성 흐름 정상 동작 확인.
5. (선택) `WEB_ORIGIN`을 최종 도메인으로 설정하면 발행 링크가 항상 그 도메인으로 고정된다.

## 6. 배포 후 체크

- 공개: `/p/[slug]` 는 발행된 제안서가 열림.
- 작성: `/`, `/proposals/*` 는 인증 없이 누구나 접근 가능(프로토타입).
- API: `/api/proposals*` 는 모두 무인증으로 열려 있음.

## 트러블슈팅

- **`@proposal/shared` 해석 실패**: `.gitignore`가 `dist`를 무시하므로 Vercel install 시 `prepare`로 빌드되어야 함. 만약 실패하면 `packages/shared/dist`를 커밋(gitignore 예외)하거나, Vercel Install Command를 `pnpm install` 로 명시.
- **Prisma 엔진/`Client` 오류**: 매 빌드에서 `prisma generate`가 실행되는지 확인(현재 build 스크립트에 포함). 캐시 문제 시 Vercel "Redeploy without cache".
- **DB 연결 수 초과**: 반드시 `DATABASE_URL`에 **pooled(-pooler)** 문자열을 사용.

## 보안 리마인더

- 이 프로토타입은 인증이 없으므로 **공개 URL에 민감·실데이터를 입력하지 말 것**.
- `.env.local` 은 `.gitignore` 대상(커밋 금지). API 키가 평문 노출된 적이 있다면 **로테이션** 권장.
- 실서비스 전환 시 작성 계열 화면·API에 인증 계층을 반드시 다시 추가할 것.
