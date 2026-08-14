# 개발 결정사항 메모

이 문서는 `CLAUDE.md`(마스터 요구사항)를 보완하는 결정 기록이다.
요구사항과 충돌하지 않으며, 요구사항에 없거나 사용자 확인이 필요했던 항목만 기록한다.

---

## 1. 원본 근거자료 위치 (2026-08-14 확정)

| 디렉터리 | 용도 |
| --- | --- |
| `docs/source/` | 대학원 소개 문서, 홈페이지 구성안 등 원본 문서 |
| `assets/source/` | 모집 이미지, 교수 명함, Oikos University 로고 등 원본 이미지 |

- 이 자료는 홈페이지 콘텐츠 작성의 **근거자료**로만 사용한다.
- 원본 파일 자체는 수정하지 않는다.
- 자료가 아직 없는 단계에서 **임의의 실제 콘텐츠를 만들어내지 않는다.**
- Git 포함 여부는 미확정. 민감정보·저작권 자료 포함 가능성이 있어
  현재는 `.gitignore` 처리되어 있다. (변경 시 `.gitignore`의 "원본 근거자료" 항목 수정)

---

## 2. 학위 명칭 표기 (2026-08-14 확정)

홈페이지의 공식 화면 표기는 다음으로 **통일**한다.

- `MBA`
- `DBA (Doctor of Business Administration)`

메뉴, Hero, 과정 소개 등 모든 사용자 화면에서 위 표기를 사용한다.

### 원본 문서 불일치 기록

원본 대학원 소개 자료에는 다음 표현이 **혼재**한다.

- `DM`
- `Doctor of Management`
- `DBA`
- `Doctor of Business Administration`

근거: 교수님이 제공한 홈페이지 구성안(`홈피구성안.hwp`)이 **"MBA · DBA 과정"** 으로
작성되어 있어 이를 기준으로 삼았다.

- 현재 홈페이지에서는 `DM` / `Doctor of Management` 를 **표시하지 않는다.**
- 원본 문서 자체는 수정하지 않는다.
- 향후 교수 검수 단계에서 이 불일치를 재확인할 필요가 있다.

> 참고: `CLAUDE.md` 23항은 원본 자료 간 표현 불일치 시 임의 선택을 금지한다.
> 본 건은 사용자(프로젝트 책임자)가 명시적으로 결정한 사항이므로 예외가 아니라 확정 결정이다.
> 교육과정 과목 수·학점에 불일치가 발견될 경우에는 임의 수정하지 않고 다시 확인한다.

---

## 3. PostgreSQL 실행 방식 (2026-08-14 확정)

- **Docker / Docker Compose 는 개발 단계에서 사용하지 않는다.**
  (초기 제안이었던 "Compose로 DB만 띄우기"는 반려됨)
- 1단계에서는 DB를 사용하지 않으므로 PostgreSQL을 설치·실행하지 않는다.
- 2단계(DB 설계·구현)에서 **로컬에 PostgreSQL을 직접 설치**해 연결한다.
- 참고: 현재 개발 PC에 `psql` 클라이언트는 설치되어 있지 않다.
- Docker는 최종 배포 단계(10단계)에서만 검토한다.

---

## 4. 관리자 인증 방식 (2026-08-14 확정)

- **Auth.js + Credentials Provider + bcrypt** 로 구현한다.
- 관리자 계정은 PostgreSQL의 `AdminUser` 에 저장하고, 비밀번호는 bcrypt 해시로만 저장한다.
- 세션/인증 시스템을 처음부터 직접 구현하지 않는다.
- Google, GitHub 등 OAuth 로그인은 구현하지 않는다.
- 권한은 `SUPER_ADMIN` / `ADMIN` 2단계. (`CLAUDE.md` 14항)

---

## 5. Git (2026-08-14 확정)

- 1단계에서 `git init` 실행.
- `.gitignore` 필수 포함 항목:
  `node_modules/`, `.next/`, `.env`, `.env.local`, `.env.*.local`,
  `public/uploads/*`, `!public/uploads/.gitkeep`
- `.env.example` 은 예외적으로 커밋한다. (`CLAUDE.md` 19항)
- `docs/source/`, `assets/source/` 는 자동 커밋하지 않는다. (위 1항 참조)

---

## 기술 선택 기록

| 항목 | 선택 | 시점 |
| --- | --- | --- |
| Next.js | 16.3.1 (App Router) | 1단계 |
| React | 19.2.8 | 1단계 |
| TypeScript | 5.x | 1단계 |
| Tailwind CSS | 4.x (`@tailwindcss/postcss`) | 1단계 |
| ESLint | 9.x + `eslint-config-next` | 1단계 |
| 소스 디렉터리 | `src/` 사용 | 1단계 |
| import alias | `@/*` | 1단계 |
| 패키지 매니저 | npm | 1단계 |
| Node.js | v20.20.2 (Next 16 요구사항 20.9+ 충족) | 1단계 |

---

## 이후 단계에서 확정해야 할 미결 항목

1. 다국어 저장 방식 — 필드 접미사(`nameKo`/`nameEn`) vs 행 분리(`locale`) 혼용 기준 → **2단계**
2. 메뉴 ↔ 실제 라우트 매핑표 (메뉴 30여 개를 라우트 10~12개로 정리) → **3단계**
3. i18n 구현 방식 — `next-intl` 도입 vs 자체 구현 → **3단계**
4. 콘텐츠 편집기 — 리치텍스트 에디터 도입 여부 및 XSS sanitize 방침 → **6단계**
5. 업로드 파일 저장 경로 — `public/uploads/` 유지 vs 외부 경로 + 서빙 라우트 → **8단계**
6. 개인정보처리방침 페이지 본문, 보관기간·파기 정책 → **7단계**
7. 상담 신청 스팸 방지(honeypot / rate limit), 신규 접수 알림 메일 여부 → **7단계**
8. 다크모드 지원 여부 (현재 `globals.css` 에 `prefers-color-scheme` 기본값이 남아 있음) → **3단계**
