/**
 * 교과목 카탈로그 — **이관 원본. 화면에서는 더 이상 읽지 않는다.**
 *
 * 9단계에서 교과목의 출처가 이 파일들에서 PostgreSQL 의 `Course` 테이블로 바뀌었다.
 * 공개 페이지와 관리자 화면은 전부 DB 를 읽는다.
 *
 * 그런데도 이 파일을 지우지 않은 이유는 `scripts/seed-cms-content.ts` 가 이것을 원본으로
 * 쓰기 때문이다. 원본 문서(`docs/source/`)에서 뽑아 정리한 결과가 여기 남아 있어야
 * **빈 DB 에서 이관을 다시 재현할 수 있다.**
 *
 * ⚠️ 여기 값을 고쳐도 홈페이지는 바뀌지 않는다. 운영 중 내용 수정은 관리자 CMS 에서 한다.
 */
export type { Course, CourseCatalog, CourseKey } from "./types";
export { mbaCurriculum, dbaCurriculum } from "./curriculum";
export type { Curriculum, SemesterGroup } from "./curriculum";
