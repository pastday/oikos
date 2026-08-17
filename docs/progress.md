# 진행 상황 / 인수인계

> 이 문서는 다음 세션에서 이어서 작업할 수 있도록 **현재 상태와 다음 할 일**을 기록한다.
> 요구사항은 [`CLAUDE.md`](../CLAUDE.md), 결정 배경은 [`decisions.md`](./decisions.md) 참고.
>
> 마지막 갱신: 2026-08-17 · 9단계 완료 (세션 종료)

---

## 한눈에 보기

| 단계 | 내용 | 상태 |
| --- | --- | :---: |
| 1 | 프로젝트 초기화 (Next.js + TS + Tailwind + Git) | ✅ 완료 |
| 2 | DB / 데이터 모델 (PostgreSQL + Prisma) | ✅ 완료 |
| 3 | 공통 레이아웃 / 다국어 라우팅 | ✅ 완료 |
| 4 | 메인 홈페이지 시안 (A안) | ✅ 완료 |
| 5 | 사용자 상세 페이지 7종 | ✅ 완료 |
| — | 운영 배포 + HTTPS | ✅ 완료 |
| 6 | 입학상담 · 설명회 신청 → DB 저장 | ✅ 완료 |
| 7 | 관리자 로그인 / 권한 (Auth.js) | ✅ 완료 |
| 8 | 관리자 상담·설명회 관리 | ✅ 완료 |
| 9 | 관리자 CMS (교수진 · MBA/DBA · 교과목) | ✅ 완료 |
| 10 | **관리자 CMS (페이지 콘텐츠 · 입학안내 · FAQ)** | ⏭ 다음 |
| 11 | 파일 업로드 | 예정 |
| 12 | 테스트 / SEO / 보안 점검 | 예정 |

**현재 서비스 중**: https://oikos.pastday.co.kr
(⚠️ 운영에는 **5단계까지만** 올라가 있다. 아래 "운영 배포 미반영" 참고)

---

## 다음 세션 시작 지점

**바로 이어서 하면 되는 상태다.** 작업 중이던 것도, 반쯤 만든 것도 없다.

| 항목 | 상태 |
| --- | --- |
| Git | `main` = `origin/main`, working tree clean, 마지막 커밋 `828111d` |
| 로컬 DB | AdminUser 1 / Faculty 1 / Program 2 / Course 33 / 상담·설명회 0 |
| 검증 | `tsc` · `lint` · `build` 전부 통과한 상태로 커밋됨 |
| 테스트 데이터 | 전부 정리 완료 (잔여 0건) |

### 시작할 때 할 일

```bash
cd /home/pastday/oikos
git pull                     # 다른 곳에서 건드렸을 수도 있으니 먼저
npm run dev                  # 개발 서버 3000
```

관리자 화면을 보려면 `http://localhost:3000/admin/login` 에서 `.env` 의
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` 로 로그인한다.
(계정이 없으면 `npm run admin:create`)

### 다음 작업

**10단계 — 페이지 콘텐츠 · 입학안내 · FAQ CMS.**
아래 "다음 단계 (10단계) 시작 시 참고" 절에 재사용할 구조와 순서를 적어 두었다.

---

## 운영 배포 미반영 (중요)

**6~9단계에서 만든 것이 아직 운영 서버에 하나도 올라가 있지 않다.**
로컬에서만 완성된 상태이며, `https://oikos.pastday.co.kr` 은 5단계 화면을 서비스 중이다.

2026-08-17 확인 결과 (운영 3100 직접 요청):

| 경로 | 응답 | 뜻 |
| --- | --- | --- |
| `/ko` `/ko/faculty` | 200 | 5단계 화면 |
| `/ko/consultation` | 200 이지만 **"개발 중인 페이지입니다" 골격** | 6단계 폼 미반영 |
| `/ko/consultation/seminar` | 404 | 6단계 미반영 |
| `/admin` `/admin/login` | 404 | 7~9단계 미반영 |

운영 프로세스는 2026-08-14 에 뜬 그대로다. (`systemctl restart` 를 한 번도 하지 않았다)

올리지 않은 이유는 각 단계 지시에서 "운영 배포는 하지 않는다" 로 범위를 제한했기 때문이다.
교수 검수 후 올릴 때는 **아래 순서를 반드시 지켜야 한다.**

```bash
cd /home/pastday/oikos
git pull
npm ci
npx prisma migrate deploy    # ← 9단계 마이그레이션 적용 (semester nullable)
npm run seed:cms             # ← 교수진·과정·교과목을 운영 DB 로 이관
npm run admin:create         # ← 운영용 관리자 계정 (운영 .env 값 사용)
npm run build                # ← 빌드 시 DB 연결이 필요하다 (공개 페이지가 DB 를 읽는다)
sudo systemctl restart oikos
```

운영에서 추가로 준비해야 할 것:

- 운영 `.env` 에 **`AUTH_SECRET`** 필요. 없으면 관리자 로그인이 실패한다.
  (`openssl rand -base64 32`. 로컬 값을 그대로 쓰지 않는다)
- 운영 `.env` 의 `SEED_ADMIN_*` 은 로컬과 다른 실제 계정으로 설정한다.
- `sudo` 는 이 세션에서 쓸 수 없다. **사용자가 일반 터미널에서 직접 실행해야 한다.**

---

## 개발 환경

| 항목 | 값 |
| --- | --- |
| OS | Ubuntu 22.04.5 LTS |
| Node / npm | v20.20.2 / 10.8.2 |
| Next.js | 16.3.1 (App Router) |
| React / TypeScript | 19.2.8 / 5.x |
| Tailwind CSS | 4.x (`@tailwindcss/postcss`) |
| Prisma | 7.9.1 + `@prisma/adapter-pg` |
| PostgreSQL | 14.23 (로컬 설치, **Docker 미사용**) |
| 저장소 | `git@github.com:pastday/oikos.git` (SSH 인증) |

### 환경 관련 주의사항 (다음 세션에서 헷갈리기 쉬운 것들)

- **DB 포트는 5433** — 5432 는 다른 프로젝트(`dajungrime`)의 Docker 컨테이너가 점유 중이다. 그 컨테이너는 건드리지 않는다.
- **개발 서버 3000, 운영 서버 3100** — 운영은 systemd `oikos.service` 가 3100 에서 띄운다.
- **sudo 는 비밀번호가 필요하다.** `!` 로 실행되는 셸에는 TTY 가 없어 sudo 를 쓸 수 없다.
  systemd·nginx·certbot 작업은 **사용자가 일반 터미널에서 직접 실행**해야 한다.
- Prisma 7 은 **driver adapter 가 필수**이고 `.env` 를 자동으로 읽지 않는다.
  (`prisma.config.ts` 에서 `dotenv/config` 로 명시 로드)
- `docs/source/` 의 원본 파일명은 **NFD 정규화**라 경로를 문자열로 직접 지정하면 열리지 않는다.
  `os.listdir()` 로 순회해서 접근한다.
- 이 서버에는 `pip`, `unzip` 이 없다. ODT 는 파이썬 `zipfile`, HWP 는 직접 만든 OLE 파서로 읽었다.
  (추출 스크립트는 임시 경로에만 있었고 저장소에 없다. 필요하면 다시 만들어야 한다.)
- 스크린샷은 Playwright 가 캐시해 둔 크롬을 직접 쓴다:
  `~/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome --headless --screenshot`

---

## 운영 배포 현황

```
인터넷 → nginx (80/443)
          └ oikos.pastday.co.kr → http://127.0.0.1:3100 (systemd: oikos.service)
```

| 항목 | 값 |
| --- | --- |
| 도메인 | oikos.pastday.co.kr → 121.168.114.95 (이 서버) |
| HTTPS | ✅ Let's Encrypt, 2026-11-12 만료, 자동 갱신 |
| nginx vhost | `/etc/nginx/sites-available/oikos` (저장소 사본: `deploy/nginx/`) |
| systemd 유닛 | `/etc/systemd/system/oikos.service` (저장소 사본: `deploy/systemd/`) |
| 같은 서버의 다른 사이트 | `pastday.co.kr`, `iychoi.pastday.co.kr`, `mission.pastday.co.kr` — **건드리지 않는다** |

### 재배포 절차

```bash
cd /home/pastday/oikos
git pull && npm ci && npm run build
sudo systemctl restart oikos          # ← 이 단계를 빠뜨리면 예전 화면이 계속 보인다
```

> ⚠️ `deploy/nginx/oikos.pastday.co.kr.conf` 를 서버로 **다시 복사하지 않는다.**
> certbot 이 서버 파일에 TLS 블록을 직접 넣어두었기 때문에 덮어쓰면 HTTPS 가 끊긴다.

자세한 내용은 [`deploy/README.md`](../deploy/README.md) 참고.

---

## 코드 구조

```
src/
  app/[locale]/          ← 사용자 사이트의 root layout (html lang 을 locale 별로 바꾸기 위함)
    page.tsx             메인 (Hero + 9개 섹션)
    about  faculty  degree  admission  faq
    consultation/        상담 폼 + actions.ts(서버 액션) + seminar/ (설명회 폼)
    programs/  programs/mba  programs/dba
  app/admin/             ← 관리자 영역의 별도 root layout (한국어 고정, locale 라우팅 없음)
    login/               로그인 (보호 대상 아님 — redirect loop 방지)
    (protected)/         ★ layout 에서 requireAdmin(). 이 아래는 전부 인증 필요
      page.tsx             대시보드
      consultations/       입학상담 목록 · 상세
      seminars/            설명회 신청 목록 · 상세
      faculty/  programs/  courses/    ★ CMS (목록 · 등록 · 수정 · 삭제)
      inquiry-actions.ts   상담 상태·메모 저장 서버 액션
      cms-actions.ts       ★ 교수진·과정·교과목 저장/삭제 서버 액션
  app/api/auth/[...nextauth]/   Auth.js 엔드포인트
  auth.ts                ★ Auth.js 설정 (Credentials + bcrypt + JWT)
  components/
    layout/              Header(2행) · Footer · MobileMenu · LanguageSwitcher · Container
    home/                메인 페이지 섹션 10개
    page/                상세 페이지 공통 (PageHero · Section · Accordion · CourseList · ProgramPage · RelatedLinks)
    form/                신청 폼 공통 입력·피드백 컴포넌트
    admin/               사이드바 · 공통 UI · 검색상자 · CMS 입력 컴포넌트(form.tsx) · 각 CMS 폼
  types/next-auth.d.ts   session.user.role 타입 확장
  content/
    program-facts.ts     등록금·개강월 등 **아직 DB 로 못 옮긴** 수치
                         (학기·학점은 9단계에서 Program 테이블로 이동)
    home/                메인 콘텐츠 (ko/en)
    pages/               상세 페이지 콘텐츠 (ko/en)
    courses/             교과목 카탈로그 — **이관 원본. 화면에서 읽지 않는다**
  i18n/                  locale 정의 + UI 문자열 사전 (ko/en)
  lib/                   navigation · metadata · site-links · cn · prisma
    validation/inquiry.ts  ★ 신청 폼 검증 규칙의 단일 출처 (zod)
    auth-guard.ts          ★ requireAdmin() / requireSuperAdmin()
    admin/inquiry.ts       ★ 상태 라벨 · 쿼리 파싱 · 페이지네이션 계산
    admin/format.ts        관리자 날짜(KST) 표시
    cms/queries.ts         ★ 공개 화면용 CMS 조회 (locale fallback 포함)
    cms/revalidate.ts      ★ 저장 시 무효화할 공개 경로
    cms/validation.ts      CMS 입력 검증 (zod)
  generated/prisma/      Prisma Client (Git 미포함, 빌드 시 생성)
prisma/                  schema.prisma + migrations
scripts/                 setup-local-db.sh · create-admin.ts · seed-cms-content.ts
deploy/                  nginx · systemd · 배포 문서
docs/source/             원본 문서 (Git 미포함)
assets/source/           원본 이미지 (Git 미포함)
```

### 지켜온 원칙

- **콘텐츠와 컴포넌트를 분리한다.** 긴 문구를 컴포넌트에 직접 넣지 않는다. 이후 DB 이전을 쉽게 하기 위함.
- **수치는 `program-facts.ts` 에만 둔다.** 개강일·등록금이 바뀌어도 한 곳만 고치면 된다.
- **한/영은 같은 타입을 공유한다.** 한쪽에 키가 늘면 다른 쪽에서 컴파일 오류가 난다.
- **원본 자료에 없는 내용을 만들지 않는다.** 값이 없으면 `null` 로 두고 화면에 "준비 중"으로 표시한다.
- Server Component 가 기본. 상태·경로가 필요한 곳만 Client Component (`MobileMenu`, `LanguageSwitcher`, `DesktopNav`, `Accordion`).

---

## 데이터베이스

로컬 PostgreSQL 14, 포트 **5433**, DB `oikos_dev`, 사용자 `oikos_app` (superuser 아님, `CREATEDB` 만 보유).
비밀번호는 `.env` 에만 있고 Git·문서 어디에도 없다. 재구성은 `scripts/setup-local-db.sh`.

마이그레이션 2개: `20260814124541_init` (테이블 10개) +
`20260817155549_allow_nullable_course_semester` (9단계).
Auth.js 를 붙였지만 JWT 세션이라 `Account`/`Session`/`VerificationToken` 테이블은 만들지 않았다.

- **쓰기**: `Consultation`·`SeminarApplication` (신청 폼) / `AdminUser` (`lastLoginAt`) /
  `Faculty`·`Program`·`Course` (관리자 CMS)
- **읽기**: `AdminUser` (로그인) / `Consultation`·`SeminarApplication` (관리자) /
  **`Faculty`·`Program`·`Course` (공개 페이지)**

> ⚠️ 9단계부터 **공개 페이지가 DB 를 읽으므로 빌드 시 DB 연결이 필요하다.**
> 방문자 요청 때가 아니라 빌드·재생성 시점에만 조회한다.
- **관리자 수정**: `Consultation`·`SeminarApplication` 의 `status` / `adminMemo` **만** 바꾼다.
  신청자가 입력한 값은 관리자도 고치지 않는다. **삭제 기능은 없다.**
- 사용자 페이지는 여전히 정적 생성(SSG)이다. 관리자가 CMS 에서 저장할 때만 해당 경로를 다시 만든다.
- **관리자 화면(`/admin/*`)은 동적 렌더링(ƒ)이다.** 세션 쿠키와 DB 를 읽기 때문이다.

모델: `AdminUser` `PageSection` `Faculty` `Program` `Course` `FAQ` `Consultation` `SeminarApplication` `Media` `SiteSetting`
enum: `AdminRole` `FacultyType` `ProgramType` `CourseCategory` `InquiryStatus`

---

## 6단계에서 만든 것 (입학상담 · 설명회 신청)

| 경로 | 내용 |
| --- | --- |
| `/[locale]/consultation` | 상담 안내 + 입학상담 신청 폼 |
| `/[locale]/consultation/seminar` | 설명회 신청 폼 |

```
src/lib/validation/inquiry.ts          zod 스키마 + 오류 코드 + 스팸 필드 이름 (한 곳에 모음)
src/app/[locale]/consultation/
  actions.ts                           서버 액션 2개 (DB 쓰기는 여기서만)
  ConsultationForm.tsx                 client
  seminar/page.tsx  seminar/SeminarForm.tsx
src/components/form/
  Fields.tsx                           TextField · TextAreaField · SelectField · CheckboxField · SpamGuardFields
  FormFeedback.tsx                     SubmitButton · FormAlert · SuccessPanel · PendingNotice
src/content/pages/{types,ko,en}.ts     폼 라벨·오류 문구·안내 문구 (기존 콘텐츠 모듈에 추가)
```

핵심 규칙 (자세한 배경은 `decisions.md` 6단계 항목):

- **DB 쓰기는 서버 액션에서만.** 브라우저는 Prisma 를 건드리지 않는다.
- **저장 여부는 서버 검증만으로 결정한다.** `<form noValidate>` 로 브라우저 기본 검증을 껐다.
- **스키마에는 문구가 아니라 오류 코드가 들어간다.** 문구는 locale 콘텐츠에서 찾는다.
- `status` / `adminMemo` 는 사용자 입력에서 받지 않는다. 주입해도 무시된다(확인 완료).
- 성공하면 폼을 결과 화면으로 교체한다. 오류면 입력값을 보존한다.

### 이 단계에서 남긴 TODO

- **개인정보 처리방침 전문이 없다.** 동의 체크박스 아래에 "전문 준비 중" 안내만 있다. (7단계에서도 미해결)
- 대표 전화·카카오톡 채널 미확정 → 상담 페이지에 "확정 중" 안내만 있고 버튼은 만들지 않았다.
- 설명회 일정 미확정 → `preferredSession` 은 자유 입력(선택). 일정이 확정되면 select 로 바꾼다.
- 신규 접수 시 관리자 알림 메일 — 아직 없음. 필요 여부 미정.
- rate limit / CAPTCHA — 운영 배포 단계에서 재검토.

---

## 7단계에서 만든 것 (관리자 인증)

| 경로 | 내용 | 보호 |
| --- | --- | --- |
| `/admin/login` | 관리자 로그인 | 공개 (로그인 상태면 `/admin` 으로) |
| `/admin` | 대시보드 (접수 현황 집계) | **인증 필요** |
| `/api/auth/*` | Auth.js 엔드포인트 | — |

- **Auth.js v5** (`next-auth` 5.0.0-beta.32, **정확한 버전 고정**) + Credentials + **bcryptjs** + JWT 세션
- **Prisma Adapter 를 쓰지 않는다.** Credentials 는 DB 세션을 지원하지 않아 JWT 가 강제되고,
  그래서 Auth.js 용 테이블도 필요 없다.
- **middleware 를 쓰지 않는다.** `(protected)/layout.tsx` 에서 서버 측으로 확인한다.
  matcher 실수로 사용자 사이트가 로그인으로 튕기는 사고를 원천적으로 막기 위해서다.

### 관리자 계정 만들기

```bash
# .env 에 SEED_ADMIN_EMAIL / SEED_ADMIN_NAME / SEED_ADMIN_PASSWORD 를 넣고
npm run admin:create
```

기존 계정이 있으면 **아무것도 하지 않는다.** 비밀번호를 바꾸려면 `-- --force-password` 를 붙인다.
현재 로컬 개발 DB 에는 SUPER_ADMIN 계정이 1개 있다. (값은 `.env` 에만 있고 Git·문서에 없다)

### 다음 단계에서 쓸 인증 helper

```ts
import { requireAdmin, requireSuperAdmin } from "@/lib/auth-guard";

const admin = await requireAdmin();       // 비로그인 → /admin/login
const admin = await requireSuperAdmin();  // ADMIN → /admin (관리자 계정관리 화면용)
// admin: { id, email, name, role }
```

- 새 관리자 화면은 `src/app/admin/(protected)/` 아래에 만들면 인증이 자동으로 걸린다.
- 다만 **데이터를 바꾸는 서버 액션에서는 layout 을 믿지 말고 액션 안에서 다시 `requireAdmin()` 을 부른다.**
  서버 액션은 layout 을 거치지 않고 직접 호출될 수 있다.
- `role` 은 JWT 에 들어 있어 **권한을 바꾸면 재로그인해야 반영된다.**

### 이 단계에서 겪은 함정

- `AUTH_URL` 을 고정해두면 다른 포트로 띄웠을 때 로그인 후 그 주소로 튕겨 실패한다.
  → 주석 처리하고 `trustHost: true` 를 썼다. (`decisions.md` 7단계 항목 참고)
- Auth.js v5 환경변수는 `AUTH_SECRET`. v4 의 `NEXTAUTH_SECRET` 이 아니다.
- JWT 타입 확장은 `next-auth/jwt` 가 아니라 **`@auth/core/jwt`** 에 걸어야 병합된다.
  (`next-auth/jwt` 는 재export 만 한다)

---

## 8단계에서 만든 것 (관리자 상담 · 설명회 관리)

| 경로 | 내용 |
| --- | --- |
| `/admin/consultations` | 입학상담 목록 (검색 · 필터 · 페이지) |
| `/admin/consultations/[id]` | 입학상담 상세 + 상태/메모 저장 |
| `/admin/seminars` | 설명회 신청 목록 |
| `/admin/seminars/[id]` | 설명회 신청 상세 + 상태/메모 저장 |

### 목록 기능

| 항목 | 내용 |
| --- | --- |
| 정렬 | `createdAt DESC` 고정 (최근 신청이 위) |
| 검색 | `?q=` — 이름 · 이메일 · 연락처 부분 일치 (대소문자 무시) |
| 필터 | `?status=` / `?program=`(상담만) / `?locale=` |
| 페이지 | `?page=` `?pageSize=` — 기본 20건, 최대 100건 |

- **필터·검색·페이지는 전부 URL 쿼리다.** 북마크·공유가 되고 뒤로가기가 자연스럽다.
  대시보드 카드도 이 쿼리로 바로 연결된다. (`/admin/consultations?status=NEW` 등)
- **알 수 없는 쿼리 값은 오류로 만들지 않고 무시한다.** (`?status=HACK` → 전체 목록)
- 요청한 page 가 마지막 페이지를 넘으면 마지막 페이지로 당겨 준다.

### 상태 표시 문구

enum(`InquiryStatus`)은 두 모델이 공유하지만 **표시 문구는 도메인에 맞춘다.**

| enum | 입학상담 | 설명회 |
| --- | --- | --- |
| `NEW` | 신규 | 신규 |
| `IN_PROGRESS` | **상담중** (CLAUDE.md 12항 표현) | **진행중** |
| `COMPLETED` | 완료 | 완료 |

배지는 색만으로 의미를 전달하지 않는다. 문구가 항상 함께 있다.

### 관리자가 바꿀 수 있는 것

**`status` 와 `adminMemo` 뿐이다.** 신청자가 입력한 값은 관리자도 수정하지 않는다.

- 관리자 메모는 내부 기록이며 신청자에게 보이지 않는다. 최대 5000자.
- **삭제 기능은 만들지 않았다.** 상담 기록을 실수로 지우는 사고를 막기 위함이다.
  꼭 필요해지면 SUPER_ADMIN 전용으로 별도 검토한다.
- 상태 변경 이력을 남기는 audit table 은 만들지 않았다. `updatedAt` 과 메모로 관리한다.
- **ADMIN 과 SUPER_ADMIN 의 기능 차이는 없다.** 둘 다 조회·상태변경·메모가 가능하다.

### 지킨 보안 규칙

- 저장 서버 액션 안에서 **`requireAdmin()` 을 다시 호출한다.** layout 인증만 믿지 않는다.
  서버 액션은 layout 을 거치지 않고 직접 호출될 수 있다. (인증 없이 직접 POST → DB 변경 없음을 확인)
- `status` 는 서버에서 zod enum 으로 검증한다. 클라이언트 문자열을 그대로 넣지 않는다.
- 신청자가 쓴 글(`message`, `memo`)을 **HTML 로 렌더링하지 않는다.** 줄바꿈만 CSS 로 살린다.
- 없는 id 는 404. Prisma 오류 원문·stack trace 를 화면에 내보내지 않는다.

### 날짜 표시

DB 는 `timestamp without time zone` 이고 Prisma 가 **UTC** 로 넣는다. 저장값은 건드리지 않는다.
화면에서만 `Intl.DateTimeFormat` 에 `timeZone: "Asia/Seoul"` 을 줘서 한국 시간으로 보여준다.
서버 TZ 설정과 무관하게 결과가 같다.

> ⚠️ 컬럼이 `timestamp without time zone` 이므로 **서버 OS timezone 은 UTC 로 유지해야 한다.**
> KST 로 바꾸면 드라이버가 저장값을 다른 시각으로 해석할 수 있다.

### 이 단계에서 겪은 함정

- `Intl` 에 `hour12: false` 만 주면 자정이 **`24:17`** 로 나온다. `hourCycle: "h23"` 을 명시해야 한다.
- Prisma 의 `contains` 는 **LIKE 와일드카드를 이스케이프하지 않는다.** 검색창에 `%` 를 넣으면
  전체가 매칭됐다. `\` `%` `_` 를 이스케이프해서 넘긴다. (`buildSearchFilter`)
- 넓은 표 안의 `sr-only` 요소는 `position:absolute` 인데 기준 조상이 없으면 스크롤 컨테이너를
  벗어나 **문서 전체를 가로로 넓힌다.** 스크롤 wrapper 에 `relative` 를 줘야 한다.

---

## 9단계에서 만든 것 (교수진 · 과정 · 교과목 CMS)

| 관리자 경로 | 기능 |
| --- | --- |
| `/admin/faculty` `/new` `/[id]/edit` | 교수진 — 목록 · 등록 · 수정 · 삭제 |
| `/admin/programs` `/[type]` | 과정 — 목록 · 수정 (생성/삭제 없음) |
| `/admin/courses` `/new` `/[id]/edit` | 교과목 — 목록(필터) · 등록 · 수정 · 삭제 |

### ★ 출처가 바뀌었다

**`Faculty` · `Program` · `Course` 는 이제 DB 가 유일한 출처다.**
`src/content/` 의 해당 파일을 고쳐도 홈페이지는 바뀌지 않는다. 관리자 CMS 에서 수정한다.

DB 를 읽는 공개 화면: 메인(과정 카드·주임교수·교육과정 Preview), `/[locale]/faculty`,
`/[locale]/programs`, `/[locale]/programs/{mba,dba}`, 그리고 **입학안내·FAQ 의 학점 문구**.

### 이관 (`npm run seed:cms`)

정적 콘텐츠 → DB 일회성 이관. **이미 있는 항목은 건드리지 않으므로 다시 실행해도 안전하다.**
배포마다 자동 실행되지 않는다(`prisma db seed` 에 연결하지 않음).

이관 결과: Program 2 / Faculty 1 / Course 33 (MBA 14 · DBA 19)

### 원본 불일치를 그대로 옮겼다

| 항목 | 건수 | DB | 화면 |
| --- | --- | --- | --- |
| 학기차 미지정 | 15 | `semester = null` | "그 밖의 전공과목" · "공통과목" |
| 학점 미표기 | 1 | `credits = null` | "학점 미표기" |
| 영문 과목명 없음 | 2 | `titleEn = null` | 영문 페이지에 한국어 원표기 |
| 교과 내용 없음 | 3 | `description = null` | "교과 내용은 준비 중입니다." |

**임의로 채우지 않는다.** CMS 입력 화면에도 "원본에 없으면 비워 두세요" 안내를 넣었다.

### 캐시 — 정적 유지 + 저장 시 revalidate

공개 페이지는 정적이고, 관리자가 저장할 때 필요한 경로만 무효화한다. (`src/lib/cms/revalidate.ts`)

> ⚠️ **경로는 `/ko/faculty` 가 아니라 `/[locale]/faculty` 라우트 패턴으로 넘겨야 한다.**
> 실제 주소를 넘기면 무효화가 되지 않는다. 새 CMS 를 붙일 때 반드시 이 파일에 경로를 추가할 것.

### 겪은 함정 3가지

1. `revalidatePath` 에 실제 주소를 넘기면 동작하지 않는다 → 라우트 패턴 + `"page"` 사용.
2. `[locale]/layout.tsx` 의 `dynamicParams = false` 가 있으면 무효화된 페이지가 **404** 가 된다
   → 제거했다. 지원하지 않는 locale 은 `isLocale` 검사가 이미 404 로 처리한다.
3. 이니셜 아바타를 만들 때 `Dong-Joon Kim` 을 하이픈까지 나누면 `DJ` 가 된다 → 공백으로만 나눠 `DK`.

---

## 다음 단계 (10단계) 시작 시 참고

**목표**: 페이지 콘텐츠 · 입학안내 · FAQ CMS (`PageSection` `FAQ` 테이블)

9단계에서 만든 구조를 그대로 재사용하면 된다.

```
src/lib/cms/queries.ts      공개 화면용 조회 + locale fallback (pickLocale)
src/lib/cms/validation.ts   zod 스키마 + CmsFormState + formDataToObject
src/lib/cms/revalidate.ts   ★ 새 CMS 를 붙이면 여기에 무효화 경로를 추가
src/components/admin/form.tsx   LangSection(한국어/English) · TextField · TextAreaField …
src/components/admin/cms-ui.tsx PublishBadge · DeleteForm · Th/Td
src/app/admin/(protected)/cms-actions.ts   저장/삭제 액션 (requireAdmin 필수)
```

새 CMS 를 붙이는 순서:

1. `validation.ts` 에 zod 스키마 추가
2. `cms-actions.ts` 에 저장/삭제 액션 추가 — **반드시 `requireAdmin()` 을 먼저 호출**
3. `revalidate.ts` 에 무효화할 공개 경로 추가 (라우트 패턴으로)
4. `queries.ts` 에 공개 조회 함수 추가
5. 관리자 페이지 작성 (`form.tsx` 의 `LangSection` 으로 한/영 구분)
6. 공개 페이지를 DB 조회로 교체하고, 정적 콘텐츠 파일은 이관 원본으로만 남긴다

정해야 할 것:

- 리치텍스트 에디터 도입 여부와 XSS sanitize 방침 (`decisions.md` 미결 4번)
  9단계는 plain text + `whitespace-pre-line` 로 처리했다. 같은 방식으로 갈지 결정 필요.
- `PageSection` 의 `pageKey`/`sectionKey` 명명 규칙
- 등록금·개강월(`program-facts.ts` 잔여분)을 `SiteSetting` 으로 옮길지

---

## 미결 항목 (누가 결정해야 하는가)

### 교수 검수가 필요한 원본 자료 불일치 12건

`decisions.md` 의 표에 전부 정리되어 있다. 대표적인 것:

1. 박사 학위명 — 소개 문서 `Doctor of Management(DM)` ↔ 홈피구성안 `DBA` (화면은 DBA 로 통일 중)
2. 석사 전공과목 "8 EA 과목" ↔ 실제 나열 10과목
3. 박사 전공과목 "10 EA 과목" ↔ 실제 나열 14과목
4. 박사 학기 — `6학기제` 와 `5학기(45학점)` 동시 기재
5. 교과목 2건이 중복 기재되고 영문명이 서로 다름
6. `세계 호텔, 리조트 문화의 진화` 의 설명이 다른 과목과 완전히 동일 (복사 오류 추정)
7. 전공 영문명 — 소개 문서 `Hotel, …` ↔ 명함 `Tourism, …`
8. `호텔, 외식 문화의 세계적 다양성` 학점 표기 누락
9. `글로벌 미식과 와인의 상징성` 이 편성표에만 있고 커리큘럼 목록에 없음
10. LMS 사용료 금액 불명확 (원본에 `-` 로만 표기)
11. 대표 연락처 미확정 (명함과 모집 이미지의 연락처가 다름)
12. 총장 인사말 본문 없음 / 주임교수 외 교수진 명단 없음

### 자료가 들어오면 할 일

- FICB 공식 URL → `src/lib/site-links.ts` 의 `href` 채우기 (현재 "링크 준비중" 표시)
- 교수 프로필 사진 → 현재 이니셜 아바타(DK) 대체.
  9단계 CMS 에 `photoUrl` 직접 입력은 있으나 **파일 업로드는 11단계**다
- 배경 이미지 → 현재 Hero 는 gradient. 모집 이미지의 캠퍼스 사진은 출처 불명이라 사용하지 않았다
- 총장 인사말 / 교수진 명단 → 각 페이지의 "준비 중" 안내 대체

### 기술적으로 나중에 정할 것

- 콘텐츠 편집기 — 리치텍스트 도입 여부와 XSS sanitize 방침 (10단계에서 결정)
  9단계는 plain text + `whitespace-pre-line` 으로 처리했다
- 업로드 파일 저장 경로 — `public/uploads/` 유지 vs 외부 경로 + 서빙 라우트 (11단계)
- 다크모드 지원 여부 (현재 라이트 테마 고정)
- 디자인 B안 (배경 영상/이미지 기반) — 전체 기능 완료 후 별도 단계

---

## 자주 쓰는 명령

```bash
npm run dev                  # 개발 서버 (3000)
npm run build                # 운영 빌드
npx tsc --noEmit             # 타입 검사
npm run lint                 # ESLint
npx prisma studio            # DB 확인 (브라우저)
npm run admin:create         # 관리자 계정 생성 (.env 의 SEED_ADMIN_* 사용)
npm run seed:cms             # 정적 콘텐츠 → DB 이관 (이미 있으면 건드리지 않음)
npx prisma migrate dev       # 스키마 변경 후 마이그레이션

systemctl status oikos       # 운영 서비스 상태
journalctl -u oikos -n 50    # 운영 로그
```

각 단계 종료 시 검증 순서: `npx tsc --noEmit` → `npm run lint` → `npm run build` → URL 확인 → Git 보안 확인 → commit/push.
