import { revalidatePath } from "next/cache";
import type { ProgramType } from "@/generated/prisma/enums";

/**
 * CMS 수정 후 다시 만들어야 할 공개 페이지를 지정한다.
 *
 * 공개 페이지는 정적으로 유지하고 저장할 때만 해당 경로를 무효화한다.
 * 방문자 응답은 빠르게 두면서 관리자 수정은 즉시 반영하기 위한 선택이다.
 *
 * ## 왜 `/ko/faculty` 가 아니라 `/[locale]/faculty` 인가
 *
 * 공개 페이지는 전부 `[locale]` 동적 세그먼트에서 생성된다.
 * 이런 라우트는 **실제 주소가 아니라 라우트 패턴**으로 무효화해야 한다.
 * 처음에 `/ko/faculty` 를 넘겼더니 관리자가 저장해도 화면이 그대로였다.
 * 패턴으로 부르면 ko·en 이 한 번에 무효화되는 장점도 있다.
 *
 * **무엇을 넣을지 빠뜨리면 화면이 옛날 내용을 계속 보여준다.**
 * 그래서 "어떤 데이터가 어느 화면에 나오는지"를 이 파일 한 곳에 적어 둔다.
 * 반대로 모든 경로를 통째로 무효화하지도 않는다. 그러면 정적 유지의 이점이 사라진다.
 */

/** 메인 페이지. 과정 카드·주임교수·교육과정 Preview 가 모두 여기 있다. */
const HOME = "/[locale]";

function revalidate(pattern: string): void {
  revalidatePath(pattern, "page");
}

/**
 * 교수진 변경.
 * 교수진 페이지와 메인(주임교수 Preview)에 나온다.
 */
export function revalidateFaculty(): void {
  revalidate(HOME);
  revalidate("/[locale]/faculty");
}

/**
 * 과정 변경.
 *
 * 학기 수·학점은 과정 상세뿐 아니라 **입학안내와 FAQ 문구에도 들어간다.**
 * (예: "MBA 과정은 4학기제이며 총 36학점") 그래서 그 두 페이지도 함께 무효화한다.
 */
export function revalidateProgram(type: ProgramType): void {
  revalidate(HOME);
  revalidate("/[locale]/programs");
  revalidate(`/[locale]/programs/${type.toLowerCase()}`);
  revalidate("/[locale]/admission");
  revalidate("/[locale]/faq");
}

/**
 * 교과목 변경.
 * 해당 과정 상세의 교육과정과 메인의 교육과정 Preview 에 나온다.
 */
export function revalidateCourse(type: ProgramType): void {
  revalidate(HOME);
  revalidate(`/[locale]/programs/${type.toLowerCase()}`);
}
