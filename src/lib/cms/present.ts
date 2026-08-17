import type { HomeContent } from "@/content/home";
import type { ProgramView } from "./types";

/**
 * DB 의 과정 수치를 화면 문구와 합쳐 카드에 쓸 문자열로 만든다.
 *
 * 숫자는 DB, 단위·조사 같은 표현은 콘텐츠 파일에 있다.
 * 둘을 합치는 규칙을 화면마다 반복하지 않도록 여기 한 곳에 둔다.
 *
 * 값이 없으면(`null`) 해당 줄을 아예 만들지 않는다.
 * 원본에 없는 값을 "0" 이나 "미정" 으로 지어내지 않기 위해서다.
 */
export type ProgramCardFacts = {
  duration: string | null;
  totalCredits: string | null;
  breakdown: string | null;
  chapel: string | null;
};

export function buildProgramCardFacts(
  program: ProgramView,
  labels: HomeContent["programs"]["labels"],
): ProgramCardFacts {
  const { durationSemesters, totalCredits, majorCredits, commonCredits, chapelCourses } =
    program;

  return {
    duration: durationSemesters === null ? null : String(durationSemesters),
    totalCredits: totalCredits === null ? null : String(totalCredits),
    breakdown:
      majorCredits === null || commonCredits === null
        ? null
        : labels.breakdownTemplate
            .replace("{major}", String(majorCredits))
            .replace("{common}", String(commonCredits)),
    chapel:
      chapelCourses === null
        ? null
        : labels.chapelTemplate.replace("{n}", String(chapelCourses)),
  };
}
