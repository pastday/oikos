# 진행 상황 / 인수인계

> 이 문서는 다음 세션에서 이어서 작업할 수 있도록 **현재 상태와 다음 할 일**을 기록한다.
> 요구사항은 [`CLAUDE.md`](../CLAUDE.md), 결정 배경은 [`decisions.md`](./decisions.md) 참고.
>
> 마지막 갱신: 2026-08-18 · 12단계 완료 · **운영 반영까지 끝난 상태에서 세션 종료**

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
| 10 | 관리자 CMS (페이지 콘텐츠 · 입학안내 · FAQ) | ✅ 완료 |
| 11 | 파일 업로드 · 미디어 관리 | ✅ 완료 |
| 12 | 미디어를 공개 콘텐츠에 연결 | ✅ 완료 |
| 13 | **테스트 / SEO / 보안 점검** | ⏭ 다음 |

**현재 서비스 중**: https://oikos.pastday.co.kr — **12단계까지 전부 반영됨** ✅
(2026-08-18 14:55 재시작. 공개 페이지·관리자·미디어 서빙 모두 확인)
(⚠️ 운영과 개발이 같은 디렉터리·같은 DB 를 쓴다. 아래 "운영 전환 체크리스트" 참고)

---

## 다음 세션 시작 지점

**바로 이어서 하면 되는 상태다.** 작업 중이던 것도, 반쯤 만든 것도 없다.

| 항목 | 상태 |
| --- | --- |
| Git | `main` = `origin/main`, working tree clean |
| DB | Faculty 1 · Program 2 · Course 33 · PageSection 19 · PageSectionItem 30 · FAQ 8 · SiteSetting 8 · Media 0 · 상담/설명회 0 |
| 검증 | `tsc` · `lint` · `build` 전부 통과한 상태로 커밋됨 |
| 테스트 데이터 | 전부 정리 완료 (잔여 0건) |
| 운영 | ✅ 12단계까지 반영 완료. 밀린 배포 없음 |

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

기능은 12단계로 한 바퀴 돌았다. **남은 것은 성격이 셋으로 갈린다.**

**A. 자료만 넣으면 되는 것 (개발 불필요, 관리자 화면에서 처리)**

받는 대로 `/admin` 에서 올리고 고르면 끝난다. 코드 작업이 없다.

| 자료 | 넣는 곳 |
| --- | --- |
| 교수 사진 | 미디어 업로드 → [교수진] 에서 선택 |
| 모집요강 PDF | 미디어 업로드 → [입학안내 → 모집안내] 문서 칸 |
| 인증 기관 로고 (BPPE · TRACS · CHEA · SEVIS) | 미디어 업로드 → [학위 및 인증 → 인가 및 인증] 각 항목 |
| 총장 인사말 본문 | [페이지 콘텐츠 → 대학원 소개 → 총장 인사말] |
| 교수진 명단 (주임교수 외) | [교수진] 에서 추가 |
| FICB 공식 URL | `src/lib/site-links.ts` (여기만 코드다) |

**B. 결정이 필요한 것** — 아래 "미결 항목" 절 참고.
특히 교수 검수가 필요한 원본 자료 불일치 12건은 자료 확정 전에는 진행할 수 없다.

**C. 남은 단계**

- **13단계 — 테스트 / SEO / 보안 점검**
  각 단계에서 그때그때 확인해 왔지만, 전체를 한 번에 훑는 작업은 아직 하지 않았다.
  SEO 는 `buildPageMetadata` 로 title·description·canonical·OG 를 넣어 두었으나
  sitemap.xml · robots.txt 는 없다.
- **디자인 B안 (Hero 이미지/영상)** — 미디어 연결 기반(`MediaBlocks` · `MediaPicker`)은
  12단계에서 만들어 두었다. Hero 자체는 손대지 않았다.
- **운영 전환 체크리스트** — 아래 절. 교수 검수 전에 반드시 처리한다.

---

## 운영 반영 이력

밀린 배포는 없다. **코드·빌드·운영 프로세스가 모두 같은 지점(`8d00f67`)에 있다.**

| 시각 (UTC) | 반영 내용 |
| --- | --- |
| 2026-08-14 15:14 | 5단계까지 (이후 오래 재시작하지 않아 6~9단계가 밀려 있었다) |
| 2026-08-18 12:28 | 6~9단계 (상담 폼 · 관리자 인증 · 상담관리 · CMS) |
| 2026-08-18 14:05 | 10~11단계 + systemd `ReadWritePaths` (업로드 디렉터리 쓰기 권한) |
| 2026-08-18 14:55 | 12단계 (미디어 ↔ 공개 콘텐츠 연결) |

### 앞으로 배포할 때

```bash
cd /home/pastday/oikos
git pull && npm ci
npx prisma migrate deploy    # 스키마 변경이 있을 때만
npm run build                # 빌드 시 DB 연결이 필요하다 (공개 페이지가 DB 를 읽는다)
sudo systemctl restart oikos # ← 빠뜨리면 예전 화면이 계속 보인다
```

> **`npm run build` 는 운영이 읽는 `.next` 를 그 자리에서 덮어쓴다.** 같은 디렉터리이기 때문이다.
> 빌드 후 재시작 전까지는 프로세스와 디스크의 빌드가 어긋난 상태다. 빌드했으면 반드시 재시작한다.

---

## ⚠️ 운영 전환 체크리스트 (교수 검수 후 반드시 처리)

지금 구조는 **개발 편의를 위해 운영과 개발이 하나로 붙어 있다.** 실제 운영 전환 시 분리해야 한다.

### 1. 개발 / 운영 DB 분리 — **필수**

`systemd` 유닛의 `WorkingDirectory` 가 `/home/pastday/oikos` 로 **개발 디렉터리와 같다.**
`.env.production` 에는 `SITE_URL` 만 있고 `DATABASE_URL` 이 없어, 운영도 `.env` 의
`oikos_dev` (localhost:5433) DB 를 그대로 읽는다. 즉 **개발 DB = 운영 DB** 다.

그래서 지금은:

- 로컬에서 만든 테스트 콘텐츠가 **즉시 운영 사이트에 노출된다.**
- `npm run dev` / `npm run build` 가 운영이 읽는 `.next` 를 건드린다.
- 파괴적 마이그레이션이나 `seed` 사고가 곧바로 운영 사고가 된다.

→ **개발 중에는 운영 DB 에 대한 삭제·초기화·파괴적 migration 을 절대 하지 않는다.**
→ 전환 시 별도 DB(`oikos_prod`)와 별도 배포 디렉터리를 만들고 `.env.production` 에
   `DATABASE_URL` 을 넣는다.

### 2. 운영 관리자 계정 교체 — **필수**

현재 유일한 SUPER_ADMIN 의 이메일 도메인이 `@oikos.local` 로 **수신 불가한 개발용 주소**이고,
비밀번호도 `.env` 의 개발용 값이다.

→ 운영 `.env` 의 `SEED_ADMIN_*` 을 실제 계정으로 바꾼 뒤 `npm run admin:create` 로 새로 만들고,
   개발용 계정은 비활성화(`isActive = false`)하거나 삭제한다.
→ 운영 `AUTH_SECRET` 도 로컬과 다른 값으로 재발급한다. (`openssl rand -base64 32`)

### 3. 업로드 파일은 이미 분리돼 있다 — **옮기지 말 것**

11단계부터 업로드 파일은 저장소 밖(`/home/pastday/oikos-data/uploads`)에 있다.
바로 이 "개발/운영 분리" 를 대비한 구조이므로, 디렉터리를 나눌 때도 **이 경로는 그대로 둔다.**
경로를 바꾸려면 `UPLOAD_DIR` 환경변수와 systemd `ReadWritePaths` 를 함께 고쳐야 하고,
`Media.path` 는 공개 URL(`/media/…`)이라 파일을 옮겨도 DB 는 손댈 필요가 없다.

### 4. 그 밖에

- 개인정보 처리방침 전문 게재 (현재 "준비 중" 안내만 있음)
- 신청 폼 rate limit / CAPTCHA 검토
- `sudo` 는 Claude 세션에서 쓸 수 없다. **사용자가 일반 터미널에서 직접 실행해야 한다.**

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

위 "운영 전환 체크리스트 → 재배포 순서" 에 적어 두었다. 두 곳에 적으면 갈라지므로 한 곳만 유지한다.

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
      pages/               ★ 페이지 콘텐츠 CMS (섹션 · 반복 항목 · 입학안내 수치)
      faq/                 ★ FAQ CMS
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
    program-facts.ts     금액 표기 함수(formatKrw)와 **이관 원본** 수치
                         (학기·학점 → 9단계 Program, 등록금·개강 → 10단계 SiteSetting)
    home/                메인 콘텐츠 (ko/en)
    pages/               상세 페이지 콘텐츠 — about·degree·admission·faq 는 **이관 원본**.
                         화면이 아직 읽는 것은 표 열 제목·링크 라벨·폼 문구뿐이다
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
    cms/page-catalog.ts    ★ 페이지 콘텐츠 CMS 의 구조 정의 (어떤 섹션·슬롯·항목이 있는지)
    cms/page-view.ts       섹션 → 화면용 변환 (값 없을 때 규칙)
  generated/prisma/      Prisma Client (Git 미포함, 빌드 시 생성)
prisma/                  schema.prisma + migrations
scripts/                 setup-local-db.sh · create-admin.ts · seed-cms-content.ts · seed-page-content.ts
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

마이그레이션 3개: `20260814124541_init` (테이블 10개) +
`20260817155549_allow_nullable_course_semester` (9단계) +
`20260818125024_add_page_section_items` (10단계 — 순수 additive).
Auth.js 를 붙였지만 JWT 세션이라 `Account`/`Session`/`VerificationToken` 테이블은 만들지 않았다.

- **쓰기**: `Consultation`·`SeminarApplication` (신청 폼) / `AdminUser` (`lastLoginAt`) /
  `Faculty`·`Program`·`Course`·**`PageSection`·`PageSectionItem`·`FAQ`·`SiteSetting`** (관리자 CMS)
- **읽기**: `AdminUser` (로그인) / `Consultation`·`SeminarApplication` (관리자) /
  **`Faculty`·`Program`·`Course`·`PageSection`·`PageSectionItem`·`FAQ`·`SiteSetting` (공개 페이지)**

> ⚠️ 9단계부터 **공개 페이지가 DB 를 읽으므로 빌드 시 DB 연결이 필요하다.**
> 방문자 요청 때가 아니라 빌드·재생성 시점에만 조회한다.
- **관리자 수정**: `Consultation`·`SeminarApplication` 의 `status` / `adminMemo` **만** 바꾼다.
  신청자가 입력한 값은 관리자도 고치지 않는다. **삭제 기능은 없다.**
- 사용자 페이지는 여전히 정적 생성(SSG)이다. 관리자가 CMS 에서 저장할 때만 해당 경로를 다시 만든다.
- **관리자 화면(`/admin/*`)은 동적 렌더링(ƒ)이다.** 세션 쿠키와 DB 를 읽기 때문이다.

모델: `AdminUser` `PageSection` `PageSectionItem` `Faculty` `Program` `Course` `FAQ`
`Consultation` `SeminarApplication` `Media` `SiteSetting`

> `Media` 는 11단계부터 쓰인다. 11단계에서는 스키마를 바꾸지 않았고,
> 12단계에서 **역참조(사용처)만 추가**했다.
> 기존 컬럼(`originalName` `storedName` `mimeType` `size` `path` `altKo` `altEn`)으로 충분했다.
> `path` 에는 파일시스템 경로가 아니라 **공개 URL**(`/media/<uuid>.jpg`)을 넣는다.
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

## 10단계에서 만든 것 (페이지 콘텐츠 · 입학안내 · FAQ CMS)

| 관리자 경로 | 기능 |
| --- | --- |
| `/admin/pages` | 페이지 목록 (대학원 소개 · 학위 및 인증 · FAQ 안내문) |
| `/admin/pages/[pageKey]` | 섹션 목록. `admission` 일 때만 위에 **입학안내 수치** 편집이 함께 나온다 |
| `/admin/pages/[pageKey]/[sectionKey]` | 섹션 문구 편집 + 반복 항목 목록 |
| `…/items/new` `…/items/[itemId]/edit` | 반복 항목 등록 · 수정 · 삭제 |
| `/admin/faq` `/new` `/[id]/edit` | FAQ — 목록 · 등록 · 수정 · 삭제 · 공개여부 · 정렬 |

메뉴는 [페이지 콘텐츠] · [입학안내] · [FAQ] 세 개다. 다만 **입학안내는 별도 화면이 아니라
`/admin/pages/admission` 으로 가는 지름길**이다. 입학안내도 결국 같은 `PageSection` 이라
편집 화면을 두 벌 만들 이유가 없었다. 등록금 수치 패널만 그 페이지에서 추가로 그린다.
(AdminNav 의 `excludes` 는 두 메뉴가 동시에 활성으로 보이는 것을 막기 위한 것이다)

### ★ 출처가 또 바뀌었다

**`/about` `/degree` `/admission` `/faq` 의 문구는 이제 DB 가 출처다.**
`src/content/pages/{ko,en}.ts` 를 고쳐도 홈페이지는 바뀌지 않는다. 관리자 CMS 에서 수정한다.

정적 파일에 **여전히 남아 화면에 쓰이는 것**은 UI 뼈대 문구뿐이다.
등록금 표의 열 제목, 관련 링크 라벨, 외부 사이트 버튼 문구, 신청 폼 문구.
(어떤 금액이 어느 열인지는 화면 구조라서 관리자가 바꿀 대상이 아니다)

### 스키마 변경 — 순수 additive

`20260818125024_add_page_section_items`

- `page_sections` 에 nullable 컬럼 6개 추가: `subtitleKo/En` `highlightKo/En` `noteKo/En`
- `page_section_items` 테이블 신설 (`sectionId` FK, `onDelete: Cascade`)

`DROP` 도 타입 변경도 없다. 기존 데이터에 영향이 없음을 `migrate diff` 로 먼저 확인하고 적용했다.

### 텍스트 슬롯 5쌍 + 반복 항목

섹션 종류마다 컬럼을 따로 두지 않고 범용 슬롯을 공유한다.

| 슬롯 | 보통 쓰임 | 예외 |
| --- | --- | --- |
| `title` | 섹션 제목 | intro 에서는 페이지 h1 |
| `subtitle` | 제목 아래 설명 한 줄 | intro 에서는 상단 eyebrow |
| `body` | 본문 문단 (**빈 줄로 문단 구분**) | intro 에서는 설명 한 문단 |
| `highlight` | 강조 박스 | 현재 `degree/foreign-doctorate` 만 사용 |
| `note` | 하단 보조 안내 | `degree/faq-link` 에서는 버튼 문구 |

**어느 슬롯이 화면 어디에 나오는지는 `src/lib/cms/page-catalog.ts` 가 라벨로 설명한다.**
관리자 화면에는 카탈로그의 라벨이 표시되므로 슬롯 이름을 알 필요가 없다.

반복되는 카드·팩트·절차·일정·비고는 `PageSectionItem` 에 `label` / `value` / `variant` 로 담는다.

### ★ 카탈로그가 구조의 단일 출처다

`src/lib/cms/page-catalog.ts` 가 **어떤 `pageKey`/`sectionKey` 가 존재하는지** 정한다.
공개 페이지 레이아웃이 고정되어 있어 관리자가 임의의 섹션을 만들어도 그려 줄 화면이 없다.
그래서 서버 액션이 카탈로그에 없는 키를 거부하고, 카탈로그가 정의한 슬롯만 저장한다. (allowlist)

**새 섹션을 CMS 로 열려면 카탈로그에 항목을 추가하고 공개 페이지에서 그 섹션을 읽으면 된다.**

명명 규칙: `pageKey` 는 공개 경로 세그먼트와 같게(`about` → `/[locale]/about`),
`sectionKey` 는 화면 순서대로 kebab-case. 덕분에 `revalidatePageContent()` 가
경로 표를 따로 들고 있지 않아도 된다.

### 값이 없을 때의 규칙 (원칙 5)

- **섹션 행이 없으면 그 섹션을 그리지 않는다.** 페이지는 정상적으로 나온다.
- 섹션은 있는데 슬롯이 비어 있으면 **그 부분만** 그리지 않는다. 정적 콘텐츠로 되돌리지 않는다.
  되돌리면 관리자가 일부러 비운 문구가 되살아나 화면과 CMS 가 갈라진다.
- **예외는 페이지 제목 하나뿐이다.** 비면 h1 과 검색엔진 제목이 사라지므로 이때만 정적 값을 쓴다.
- 등록금 금액이 비어 있으면 표에 `-`. 원본에 금액이 없는 항목(LMS)이 실제로 있다.

### 입학안내 수치는 SiteSetting

`tuition.mba` `tuition.dba` `fee.admissionReview` `fee.lms` `fee.administrative`
`intake.year` `intake.month` `exchangeRate.base`

`Program` 이 아니라 `SiteSetting` 에 둔 이유: 수수료·개강월은 과정 공통이라 과정 테이블에
넣으면 같은 값이 두 행에 중복된다. 등록금만 과정별로 나누면 입학안내 수치가 두 화면으로 갈라진다.
저장은 문자열, 표기는 화면에서 `formatKrw` 로 한다. (한/영을 따로 입력받지 않는다)

### ⚠️ 수치가 든 문구는 자동으로 따라오지 않는다

FAQ 답변과 입학절차 설명에는 학점·학기·금액이 **문장 안에 확정 문자열로** 들어 있다.
이관하면서 그렇게 굳혔다. (사용자 결정 — 치환 토큰 문법은 비개발자 운영자에게 위험하다)

그래서 **과정 학점이나 등록금을 바꾸면 그 문구는 관리자가 직접 고쳐야 한다.**
잊지 않도록 과정 편집 화면과 입학안내 수치 패널에 경고 배너를 두었다.
`degree/degrees` 카드의 학기·학점만은 예외로 `Program` 에서 직접 읽는다.

### 이관 (`npm run seed:pages`)

정적 콘텐츠 → DB 일회성 이관. 9단계 `seed:cms` 와 별개 명령이다.

이관 결과: PageSection 19 / PageSectionItem 30 / FAQ 8 / SiteSetting 8

**멱등하다.** 섹션은 `(pageKey, sectionKey)` 로, FAQ 는 `questionKo` 로, SiteSetting 은 `key` 로
찾아 이미 있으면 건너뛴다. 항목은 **섹션에 항목이 하나라도 있으면 그 섹션을 통째로 건너뛴다.**
행 단위 자연키로 맞추면 관리자가 카드 문구를 고쳤을 때 원본 카드가 다시 생겨 중복이 된다.

### 이관 정확성 검증

정적 원본의 모든 문자열과 DB 를 대조했다. **한/영 각각 123개 문자열이 전부 일치**했고
누락도 임의 추가도 0건이었다. 학사일정 `variant`(semester/break) 6건도 확인했다.

렌더링 회귀는 더 확실하게 봤다. 변경 전(HEAD) 빌드와 변경 후 빌드의 **프리렌더 HTML 텍스트를
12개 페이지에 대해 비교했고 전부 동일**했다. (ko/en × about·degree·admission·faq·faculty·programs)

### 이 단계에서 겪은 함정

1. **슬롯 스키마를 전부 필수로 두면 모든 섹션 저장이 실패한다.**
   폼은 카탈로그가 정한 칸만 그리므로 나머지 슬롯은 FormData 에 **키 자체가 없다.**
   `optionalLong` 은 키가 있어야 통과한다 → `absentAsNull` 로 "칸이 없는 것"도 null 로 본다.
   타입 검사·빌드는 전부 통과했고 **실제로 저장 요청을 보내고 나서야 발견**했다.
2. Server Action 을 curl 로 호출하려면 **`Origin` 헤더가 필요하다.** 없으면 Next 가 CSRF 로 막는다.
   (`⚠ Missing origin header from a forwarded Server Actions request`)
3. 개발 중 `npm run build` 는 **운영이 읽는 `.next` 를 덮어쓴다.** 같은 디렉터리이기 때문이다.
   빌드 후에는 운영 프로세스와 디스크의 빌드가 어긋나므로 재시작이 필요하다.

---

## 11단계에서 만든 것 (파일 업로드 · 미디어 관리)

| 관리자 경로 | 기능 |
| --- | --- |
| `/admin/media` | 목록 (미리보기 · 파일명 · 형식 · 크기 · 올린 날짜 · 대체텍스트) |
| `/admin/media/new` | 업로드 (파일 + 한/영 대체 텍스트) |
| `/admin/media/[id]` | 상세 · 대체텍스트 수정 · **사용처 표시** · 삭제 |
| `/media/[name]` | 공개 서빙 라우트 (인증 없음) |

### ★ 파일 저장 위치 — 소스 트리 **밖**

```
/home/pastday/oikos-data/uploads/<uuid>.jpg
```

`public/uploads/` 가 아니라 프로젝트 디렉터리의 **형제**에 둔다.
개발 디렉터리와 운영 디렉터리가 같기 때문에, 소스 트리 안에 두면 `git clean` 한 번이나
배포 디렉터리 교체로 운영 데이터가 사라진다. 밖에 두면 저장소를 어떻게 다루든 파일이 남고,
나중에 개발/운영 디렉터리를 분리해도 같은 파일을 그대로 공유할 수 있다.

경로는 `UPLOAD_DIR` 환경변수로 바꿀 수 있다. 값이 없으면 위 기본 위치를 쓴다.

### ⚠️ systemd 를 고쳐야 업로드가 된다

유닛에 **`ProtectHome=read-only`** 가 걸려 있어 `/home` 전체가 서비스에게 읽기 전용이다.
`ReadWritePaths` 에 업로드 디렉터리를 추가하지 않으면 **저장이 EROFS/EACCES 로 실패한다.**

```ini
ReadWritePaths=/home/pastday/oikos/.next
ReadWritePaths=/home/pastday/oikos-data/uploads   # ← 11단계에서 추가
```

`deploy/systemd/oikos.service` 사본은 갱신해 두었다. **운영 반영은 사용자가 직접 해야 한다.**

```bash
sudo cp /home/pastday/oikos/deploy/systemd/oikos.service /etc/systemd/system/oikos.service
sudo systemctl daemon-reload
sudo systemctl restart oikos
```

디렉터리는 이미 만들어 두었다. (`755`, 소유자 `pastday:pastday` — 서비스 계정과 같다.
`chmod 777` 은 쓰지 않았다)

### 서빙은 nginx 가 아니라 Next.js 라우트

`public/` 밖이라 Next.js 가 자동으로 내보내지 않는다. `src/app/media/[name]/route.ts` 가 읽어서
스트리밍한다. nginx 는 이미 모든 요청을 Next.js 로 넘기고 있어 **설정을 건드리지 않았다.**
(certbot 이 관리하는 vhost 를 수정하지 않는 것이 이 프로젝트의 원칙이다)
덕분에 개발(3000)과 운영(3100)의 동작이 같다.

응답 헤더: `Cache-Control: immutable`(이름이 UUID 라 내용이 바뀌면 이름도 바뀐다),
`X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'`.

### 허용 형식과 크기

| 종류 | 형식 | 최대 |
| --- | --- | --- |
| 이미지 | JPEG · PNG · WebP | 10 MB |
| 문서 | PDF | 20 MB |

**SVG 는 받지 않는다.** 이미지처럼 보이지만 `<script>` 를 품을 수 있는 XML 문서다.
0바이트 파일도 거부한다.

**확장자와 브라우저가 알려준 MIME 을 믿지 않는다.** 파일 앞부분의 signature(magic bytes)로
실제 형식을 판정하고, **저장 확장자도 그 판정 결과에서 만든다.**
그래서 `evil.html` 을 `photo.jpg` 로 이름만 바꿔 올려도 거부된다. (실제로 시험했다)

### 안전한 파일명

저장 이름은 `randomUUID()` + 판정된 확장자다. **사용자가 올린 원본 파일명은 경로에 전혀 쓰이지 않는다.**
`../` 같은 조작이 들어올 자리가 없다. 원본 이름은 표시용으로 `originalName` 에만 남는다.
서빙 라우트는 우리가 만든 이름 형식만 통과시키고 `basename` 으로 한 번 더 자른다.

### 삭제 정책 — 사용 중이면 거부

`Faculty.photoUrl` 에 걸려 있으면 삭제하지 않고 **어디서 쓰는지 알려 준다.**
cascade 로 지우지 않는다. 쓰던 쪽을 먼저 정리하게 하는 편이 안전하다.
사용처 검사는 `src/lib/media/usage.ts` 한 곳에 모아 두었다. 사용처가 늘면 여기에 추가한다.

### 파일과 DB 가 어긋나지 않게 하는 순서

파일시스템에는 트랜잭션이 없으므로 순서로 방어한다.

| | 순서 | 실패하면 |
| --- | --- | --- |
| 업로드 | 검증 → **파일 저장** → DB insert | DB 가 실패하면 방금 쓴 파일을 지운다 |
| 삭제 | 사용처 확인 → **DB 삭제** → 파일 삭제 | 파일 삭제가 실패해도 참조가 없어 노출되지 않는다 |

방향이 반대인 이유: 업로드는 "DB 에 있는데 파일이 없는" 상태를 막아야 하고,
삭제는 그 상태를 만들지 않으면서 끝나야 한다. 남을 수 있는 것은 **아무도 참조하지 않는 파일**뿐이고
이름을 아는 사람이 없어 노출되지 않는다. 로그를 보고 수동으로 지우면 된다.

DB 행은 있는데 파일이 없으면 관리자 화면이 깨지지 않고 **"파일 없음"** 으로 표시한다.

### 교수진 사진 연동

`FacultyForm` 의 사진 입력을 `MediaPicker` 로 바꿨다. 올려 둔 이미지를 눌러 고르거나
주소를 직접 넣을 수 있고, 현재 사진 미리보기와 선택 해제도 된다.
**PDF 는 선택 목록에 나오지 않는다.** 사진 자리에 PDF 를 고르면 화면이 깨진다.

저장되는 값은 언제나 **공개 URL 문자열**이며 파일시스템 경로가 아니다.
`name` 만 바꾸면 다른 곳(PageSection 이미지 등)에서도 그대로 재사용할 수 있다.

김동준 교수에게는 **사진을 넣지 않았다.** 원본 자료에 사진이 없어 임의로 만들지 않는다.
사진이 없으면 지금처럼 이니셜 아바타(DK)가 나온다.

### 이 단계에서 겪은 함정 3가지

1. **Server Actions 의 기본 본문 제한이 1MB 다.** 그대로 두면 10MB·20MB 정책이 동작하지 않고
   그 전에 413 으로 끊겨 사용자에게는 500 으로 보인다.
   `next.config.ts` 에 `serverActions.bodySizeLimit = "21mb"` 를 넣었다.
   nginx 의 `client_max_body_size`(24m)보다 작게 잡아야 너무 큰 파일이 nginx 에서 잘리지 않고
   우리 검증까지 도달해 한국어로 안내된다.
2. **Turbopack 이 한글 주석이 있는 줄에서 코드프레임을 그리다 패닉했다.**
   (`end byte index ... is not a char boundary`) 오류 자체가 아니라 **오류를 표시하다** 죽는 것이라
   원인을 알 수 없었다. `next build --webpack` 으로 돌려 보니 성공해서 코드 문제가 아님을 확인했고,
   바이트 오프셋으로 해당 줄을 역추적해 찾았다.
3. 그 밑에 있던 진짜 경고는 **"Dynamic filesystem access causes tracing of the whole project"** 였다.
   업로드 경로가 프로젝트 밖이라 Next 가 `public/` 까지 서버 번들에 넣으려 한 것이다.
   Next 가 안내하는 대로 해당 호출에만 `/* turbopackIgnore: true */` 를 달아 껐다.
   `src/lib/media/` 를 `url.ts`(순수) / `storage.ts`(`node:` 사용)로 나눈 것도 이때다.

### 이번 단계에서 하지 않은 것

- **`PageSection` 에 이미지·파일 필드를 추가하지 않았다.** (12단계에서 추가했다)
  그래서 이 단계까지는 업로드하고 URL 을 확보하는 것까지만 됐다.
- 자동 resize·압축·썸네일 생성 — 원본을 그대로 저장한다.
- content hash 중복 제거 — 같은 파일을 여러 번 올릴 수 있고, 저장 이름은 항상 다르다.
- Media seed — 실제 파일은 관리자가 올린다. `assets/source/` 를 자동 import 하지 않는다.

---

## 12단계에서 만든 것 (미디어를 공개 콘텐츠에 연결)

11단계에서 올린 파일을 실제 페이지에서 쓸 수 있게 연결했다.
**공개 디자인(A안)은 그대로다.** 파일을 지정하지 않으면 화면은 이전과 완전히 같다.

### 스키마 — 참조를 전부 FK 로 통일

`20260818142008_add_media_relations_to_content`

| 모델 | 필드 | 대상 |
| --- | --- | --- |
| `PageSection` | `mediaId` | 섹션 대표 이미지 |
| `PageSection` | `documentMediaId` | 섹션 첨부 문서 (모집요강 PDF) |
| `PageSectionItem` | `mediaId` | 항목 이미지 (인증 기관 로고 등) |
| `Faculty` | `photoMediaId` | 교수 사진 — **`photoUrl` 문자열에서 전환** |

전부 nullable, 전부 **`onDelete: Restrict`**.

`Faculty.photoUrl` 을 함께 바꾼 이유: 참조 방식이 두 가지로 갈라지면 사용처 검사도
두 벌이 되고, 사용처가 늘 때마다 어느 쪽인지 판단해야 한다. Media 0건 · `photoUrl` 전부 null
이던 시점이라 이관할 데이터가 없어 비용이 가장 낮았다.
**대신 교수 사진에 외부 URL 을 직접 넣는 기능은 사라졌다.** 올린 파일만 고른다.

### ★ 삭제 보호가 두 겹이 됐다

1. `findMediaUsage()` — 관리자에게 **어디서 쓰는지 알려 주고** 삭제를 거절한다.
2. DB 의 `onDelete: Restrict` — 앱 검사를 지나쳐도 참조가 끊기지 않는다.

1번만 있으면 검사를 빠뜨린 경로가 생겼을 때 조용히 깨지고,
2번만 있으면 막히긴 하는데 관리자는 이유를 알 수 없다. 둘 다 필요하다.
(Prisma 로 직접 `media.delete()` 를 호출해 `P2003` 으로 막히는 것을 확인했다)

사용처 검사는 이제 **Media id** 기준이며 4곳을 본다.
`Faculty.photoMediaId` · `PageSection.mediaId` · `PageSection.documentMediaId` ·
`PageSectionItem.mediaId`. 사용처가 늘면 `src/lib/media/usage.ts` 에 추가한다.

### 어느 섹션에 어떤 칸이 나오는가 — 카탈로그가 정한다

모든 섹션에 이미지 칸을 열어 두면 어디에 넣어야 화면에 나오는지 알 수 없다.
`page-catalog.ts` 의 `image` / `document` / `items.image` 가 있는 섹션에만 칸이 나오고,
**서버도 그 칸만 저장한다.** 칸이 없는 섹션에 직접 POST 로 밀어 넣어도 무시된다.

| 섹션 | 이미지 | 문서 |
| --- | :---: | :---: |
| `about/school` | ○ | — |
| `about/goals` (카드마다) | ○ | — |
| `degree/accreditation` (카드마다) | ○ | — |
| `admission/recruit` | ○ | ○ (모집요강 PDF) |

### 타입은 서버가 다시 본다

이미지 칸에는 이미지만, 문서 칸에는 PDF 만 넣을 수 있다.
화면에서 종류별로 걸러 보여 주지만 그건 편의일 뿐이고,
`resolveMediaId()` 가 저장 직전에 **실제로 있는 파일인지**와 **종류가 맞는지**를 확인한다.
네 가지 경우(이미지 칸에 PDF / PDF 칸에 이미지 / 없는 이미지 id / 없는 PDF id)를 모두 시험했다.

### 공개 렌더링

- **이미지는 `next/image`.** 업로드 파일은 가로·세로를 모르므로 `fill` 로 그리고
  **바깥 상자가 비율을 정한다.** 어떤 크기를 올려도 레이아웃이 흔들리지 않는다.
  섹션 이미지는 16:10 `object-cover`, 항목 로고는 `object-contain`
  (로고는 여백·비율이 제각각이라 잘라 내면 알아볼 수 없다).
- **대체 텍스트는 현재 언어 → 반대 언어 → 빈 문자열** 순으로 고른다.
  빈 alt 는 "장식용" 이라는 뜻이라 화면 읽기 프로그램이 건너뛴다.
  이미지가 전하는 내용이 옆 글에 이미 있는 경우가 많아 그 편이 정확하다.
- **PDF 는 새 탭으로 연다.** 링크에 형식과 용량을 함께 적어 무엇이 열릴지 미리 알린다.
  파일이 없으면 **버튼 자체를 그리지 않는다.** 404 가 될 링크를 보여주지 않는다.
- 인증 카드에 로고가 있으면 금색 점 대신 로고를 쓴다. 둘 다 보이면 산만하다.

`revalidate` 는 바뀐 페이지만 한다. 대체 텍스트를 고치면 사용처가 알려 주는 경로만 무효화한다.
메인(`/[locale]`)은 교수 사진이 걸려 있을 때만 포함된다.

### 이 단계에서 겪은 것

- `MediaPicker` 를 **URL 문자열 입력에서 id 선택으로** 다시 만들었다.
  값은 hidden input 이 나르고, 종류 필터와 파일명 검색이 붙었다.
- 1KB 가 안 되는 파일의 용량이 `0 KB` 로 표시됐다. 비어 있는 파일처럼 보여
  최소 `1 KB` 로 적도록 고쳤다.

### 아직 하지 않은 것

- **Hero 는 연결하지 않았다.** 디자인 B안에서 다룬다.
  다만 `MediaBlocks` 와 `MediaPicker` 를 그대로 쓸 수 있게 만들어 두었다.
- 인증 기관 로고 파일은 아직 없다. **임의로 내려받지 않았고 연결 기능만 만들었다.**
- 이미지 자동 리사이즈·압축은 하지 않는다. 원본을 그대로 저장한다.

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

- 콘텐츠 편집기 — 리치텍스트는 **도입하지 않았다.** 10단계도 plain text 로 갔다.
  본문은 빈 줄로 문단을 나누고 화면이 `<p>` 로 그린다. HTML 을 저장하지 않으므로
  sanitize 대상이 없다. 표·목록이 필요해지면 그때 다시 검토한다.
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
                             #   이미 있으면 아무것도 하지 않는다.
                             #   비밀번호를 바꾸려면: npm run admin:create -- --force-password
npm run seed:cms             # 교수진·과정·교과목 이관 (9단계, 멱등)
npm run seed:pages           # 페이지 콘텐츠·FAQ·입학안내 수치 이관 (10단계, 멱등)
npx prisma migrate dev       # 스키마 변경 후 마이그레이션

systemctl status oikos       # 운영 서비스 상태
journalctl -u oikos -n 50    # 운영 로그
```

각 단계 종료 시 검증 순서: `npx tsc --noEmit` → `npm run lint` → `npm run build` → URL 확인 → Git 보안 확인 → commit/push.

### 관리자 로그인

| 환경 | 주소 |
| --- | --- |
| 운영 | https://oikos.pastday.co.kr/admin/login |
| 개발 | http://localhost:3000/admin/login |

아이디·비밀번호는 **`.env` 의 `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`** 값이다.
Git 과 이 문서 어디에도 실제 값을 적지 않는다.

### 기능을 실제로 눌러 보며 확인할 때

운영(3100)을 건드리지 않고 **별도 포트로 같은 빌드를 띄워** 확인한다.

```bash
npm run build
npx next start -p 3200 -H 127.0.0.1
```

> 끝나면 반드시 종료한다. 3200 에 옛 프로세스가 남아 있으면 방금 고친 코드가 아니라
> **예전 빌드를 시험하게 되어** 원인을 찾느라 한참 헤매게 된다. (실제로 겪었다)
