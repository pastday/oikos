# 진행 상황 / 인수인계

> 이 문서는 다음 세션에서 이어서 작업할 수 있도록 **현재 상태와 다음 할 일**을 기록한다.
> 요구사항은 [`CLAUDE.md`](../CLAUDE.md), 결정 배경은 [`decisions.md`](./decisions.md) 참고.
>
> 마지막 갱신: 2026-08-17 · 6단계 완료

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
| 7 | **관리자 로그인 / 권한 (Auth.js)** | ⏭ 다음 |
| 8 | 관리자 CMS (콘텐츠·교수진·교육과정·FAQ) | 예정 |
| 9 | 관리자 상담관리 | 예정 |
| 10 | 파일 업로드 | 예정 |
| 11 | 테스트 / SEO / 보안 점검 | 예정 |

**현재 서비스 중**: https://oikos.pastday.co.kr

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
  app/[locale]/          ← [locale]/layout.tsx 가 root layout (html lang 을 locale 별로 바꾸기 위함)
    page.tsx             메인 (Hero + 9개 섹션)
    about  faculty  degree  admission  faq
    consultation/        상담 폼 + actions.ts(서버 액션) + seminar/ (설명회 폼)
    programs/  programs/mba  programs/dba
  components/
    layout/              Header(2행) · Footer · MobileMenu · LanguageSwitcher · Container
    home/                메인 페이지 섹션 10개
    page/                상세 페이지 공통 (PageHero · Section · Accordion · CourseList · ProgramPage · RelatedLinks)
    form/                신청 폼 공통 입력·피드백 컴포넌트
  content/
    program-facts.ts     ★ 학기·학점·등록금·개강 등 수치의 단일 출처
    home/                메인 콘텐츠 (ko/en)
    pages/               상세 페이지 콘텐츠 (ko/en)
    courses/             교과목 20과목 카탈로그 + 과정별 편성
  i18n/                  locale 정의 + UI 문자열 사전 (ko/en)
  lib/                   navigation · metadata · site-links · cn · prisma
    validation/inquiry.ts  ★ 신청 폼 검증 규칙의 단일 출처 (zod)
  generated/prisma/      Prisma Client (Git 미포함, 빌드 시 생성)
prisma/                  schema.prisma + migrations
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

마이그레이션 `20260814124541_init` 로 테이블 10개가 생성되어 있다. **6단계 기준 schema 변경 없음.**

- **쓰기**: `Consultation`, `SeminarApplication` — 입학상담·설명회 신청 폼이 저장한다.
- **읽기**: 아직 없다. 관리자 화면(7~9단계)이 첫 조회 대상이 된다.
- 모든 페이지가 여전히 빌드 시점 정적 생성(SSG)이다. 폼 페이지도 DB 를 **읽지** 않으므로 SSG 로 남아 있고,
  제출만 Server Action 으로 서버에서 처리한다. 따라서 DB 가 꺼져 있어도 페이지 자체는 뜬다(제출만 실패).

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

- **개인정보 처리방침 전문이 없다.** 동의 체크박스 아래에 "전문 준비 중" 안내만 있다.
  7단계에서 처리방침 페이지를 만들고 링크로 교체할 것.
- 대표 전화·카카오톡 채널 미확정 → 상담 페이지에 "확정 중" 안내만 있고 버튼은 만들지 않았다.
- 설명회 일정 미확정 → `preferredSession` 은 자유 입력(선택). 일정이 확정되면 select 로 바꾼다.
- 신규 접수 시 관리자 알림 메일 — 아직 없음. 필요 여부 미정.
- rate limit / CAPTCHA — 운영 배포 단계에서 재검토.

---

## 다음 단계 (7단계) 시작 시 참고

**목표**: 관리자 로그인 / 권한 (Auth.js + bcrypt)

이미 준비되어 있는 것:

- `AdminUser` 테이블 + `AdminRole` enum (`SUPER_ADMIN` / `ADMIN`)
- `.env.example` 에 `AUTH_SECRET` · `AUTH_URL` · `SEED_ADMIN_*` 자리
- 인증 방식은 `decisions.md` 4항에서 이미 확정 (Auth.js + Credentials + bcrypt, OAuth 없음)

관리자 화면이 조회하게 될 데이터 구조 (6단계에서 저장되는 값):

```
Consultation        id, name, phone, email, interestedProgram(MBA|DBA|null),
                    message, status(NEW|IN_PROGRESS|COMPLETED), privacyAgreed,
                    locale("ko"|"en"), adminMemo(null), createdAt, updatedAt
SeminarApplication  id, name, phone, email, preferredSession(nullable),
                    attendeeCount(1~10), memo(nullable), status, privacyAgreed,
                    locale, adminMemo(null), createdAt, updatedAt
```

- 두 테이블 모두 `@@index([status, createdAt])` 가 있으므로 **상태 필터 + 최신순** 조회가 인덱스를 탄다.
- 신규 접수는 전부 `status = NEW` 로 들어온다. 대시보드의 "신규 건수" 는 이 값을 센다.
- `adminMemo` 는 관리자만 쓰는 필드다. 현재 전부 `null` 이다.
- 관리자 화면은 DB 를 읽으므로 **정적 생성 대상이 아니다.** 사용자 페이지와 달리 동적 렌더링이 된다.

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
- 교수 프로필 사진 → 현재 이니셜 아바타(DK) 대체
- 배경 이미지 → 현재 Hero 는 gradient. 모집 이미지의 캠퍼스 사진은 출처 불명이라 사용하지 않았다
- 총장 인사말 / 교수진 명단 → 각 페이지의 "준비 중" 안내 대체

### 기술적으로 나중에 정할 것

- 콘텐츠 편집기 — 리치텍스트 도입 여부와 XSS sanitize 방침 (8단계)
- 업로드 파일 저장 경로 — `public/uploads/` 유지 vs 외부 경로 + 서빙 라우트 (10단계)
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
npx prisma migrate dev       # 스키마 변경 후 마이그레이션

systemctl status oikos       # 운영 서비스 상태
journalctl -u oikos -n 50    # 운영 로그
```

각 단계 종료 시 검증 순서: `npx tsc --noEmit` → `npm run lint` → `npm run build` → URL 확인 → Git 보안 확인 → commit/push.
