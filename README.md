# Oikos University 홈페이지

미국 Oikos University 경영대학원 **호텔·외식·와인경영 전공**의 한국어/영어 홍보 및 입학상담 홈페이지입니다.

- 운영 도메인 (예정): https://oikos.pastday.co.kr
- 지원 언어: 한국어 / 영어 (locale 기반 URL — `/ko`, `/en`)
- 관리자 CMS 포함 (`/admin`)

> 이 시스템은 LMS가 아닙니다. 수강신청·성적·학적·온라인 결제 등의 기능은 개발 범위에서 제외합니다.

---

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript 5 |
| UI | React 19, Tailwind CSS 4 |
| DB | PostgreSQL + Prisma ORM *(2단계 예정)* |
| 인증 | Auth.js + Credentials + bcrypt *(5단계 예정)* |
| 린트 | ESLint 9 + `eslint-config-next` |
| 배포 | Nginx, Docker *(10단계 예정)* |

개발 환경 기준: Node.js v20.20.2 / npm 10.8.2

---

## 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 템플릿 복사 후 값 입력
cp .env.example .env

# 개발 서버 실행 (http://localhost:3000)
npm run dev
```

### 사용 가능한 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |
| `npx tsc --noEmit` | 타입 검사 |

---

## 디렉터리 구조

```
src/app/          Next.js App Router 페이지 및 레이아웃
public/           정적 파일
public/uploads/   관리자 업로드 파일 (Git 미포함)
docs/             개발 문서
docs/decisions.md 개발 결정사항 기록
docs/source/      원본 문서 근거자료 (Git 미포함)
assets/source/    원본 이미지 근거자료 (Git 미포함)
```

---

## 개발 단계

전체를 한 번에 만들지 않고 단계별로 진행합니다.
현재 상태와 다음 할 일은 [`docs/progress.md`](./docs/progress.md)에 정리되어 있습니다.

| 단계 | 내용 | 상태 |
| --- | --- | :---: |
| 1 | 프로젝트 초기화 (Next.js + TS + Tailwind + Git) | ✅ 완료 |
| 2 | DB / 데이터 모델 (PostgreSQL + Prisma) | ✅ 완료 |
| 3 | 공통 레이아웃 / 다국어 라우팅 | ✅ 완료 |
| 4 | 메인 홈페이지 시안 | ✅ 완료 |
| 5 | 사용자 상세 페이지 7종 | ✅ 완료 |
| — | 운영 배포 + HTTPS | ✅ 완료 |
| 6 | 입학상담 · 설명회 신청 → DB 저장 | 다음 |
| 7 | 관리자 로그인 / 권한 | 예정 |
| 8 | 관리자 CMS | 예정 |
| 9 | 관리자 상담관리 | 예정 |
| 10 | 파일 업로드 | 예정 |
| 11 | 테스트 / SEO / 보안 점검 | 예정 |

운영 사이트: **https://oikos.pastday.co.kr**

---

## 문서

- [`CLAUDE.md`](./CLAUDE.md) — 마스터 요구사항 (항상 이 문서를 기준으로 개발)
- [`docs/progress.md`](./docs/progress.md) — **진행 상황 / 인수인계** (다음 작업 시작점)
- [`docs/decisions.md`](./docs/decisions.md) — 개발 결정사항 및 미결 항목
- [`deploy/README.md`](./deploy/README.md) — 배포 절차

---

## 주의사항

- `.env` 파일은 **절대 커밋하지 않습니다.** `.env.example` 만 템플릿으로 관리합니다.
- 관리자 비밀번호는 bcrypt 해시로만 저장하며 평문 저장을 금지합니다.
- `docs/source/`, `assets/source/` 의 원본 자료는 민감정보·저작권 문제로 Git에 포함하지 않습니다.
- 학교명·학위명·교수 직함·인증 정보는 원본 자료를 근거로만 작성하며 임의로 추측하지 않습니다.
