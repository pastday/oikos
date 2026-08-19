import { revalidatePath } from "next/cache";
import { DESIGN_B_SEGMENT } from "@/components/site-b/paths";
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
 * ## A안과 B안을 함께 무효화한다 (13단계)
 *
 * 같은 CMS 데이터를 A안(`/[locale]/faculty`)과 B안(`/[locale]/design-b/faculty`)이
 * 함께 쓴다. 한쪽만 무효화하면 **관리자가 저장한 뒤 B안만 옛 내용을 계속 보여준다.**
 * 그래서 아래 `revalidate()` 가 항상 두 벌을 같이 처리한다.
 * 호출하는 쪽은 `"/faculty"` 처럼 **공통 경로 한 개만** 넘기면 된다.
 *
 * **무엇을 넣을지 빠뜨리면 화면이 옛날 내용을 계속 보여준다.**
 * 그래서 "어떤 데이터가 어느 화면에 나오는지"를 이 파일 한 곳에 적어 둔다.
 * 반대로 모든 경로를 통째로 무효화하지도 않는다. 그러면 정적 유지의 이점이 사라진다.
 */

/** 메인 페이지. 과정 카드·주임교수·교육과정 Preview 가 모두 여기 있다. */
const HOME = "";

/**
 * locale 을 제외한 공통 경로 하나를 받아 A안·B안 두 패턴을 모두 무효화한다.
 *
 * @param path 홈은 `""`, 나머지는 `"/faculty"` 처럼 앞에 `/` 를 붙인 경로
 */
function revalidate(path: string): void {
  revalidatePath(`/[locale]${path}`, "page");
  revalidatePath(`/[locale]/${DESIGN_B_SEGMENT}${path}`, "page");
}

/**
 * 교수진 변경.
 * 교수진 페이지와 메인(주임교수 Preview)에 나온다.
 */
export function revalidateFaculty(): void {
  revalidate(HOME);
  revalidate("/faculty");
}

/**
 * 과정 변경.
 *
 * 학기 수·학점은 과정 상세뿐 아니라 **입학안내와 FAQ 문구에도 들어간다.**
 * (예: "MBA 과정은 4학기제이며 총 36학점") 그래서 그 두 페이지도 함께 무효화한다.
 */
export function revalidateProgram(type: ProgramType): void {
  revalidate(HOME);
  revalidate("/programs");
  revalidate(`/programs/${type.toLowerCase()}`);
  revalidate("/admission");
  revalidate("/faq");
}

/**
 * 교과목 변경.
 * 해당 과정 상세의 교육과정과 메인의 교육과정 Preview 에 나온다.
 */
export function revalidateCourse(type: ProgramType): void {
  revalidate(HOME);
  revalidate(`/programs/${type.toLowerCase()}`);
}

// ---------------------------------------------------------------------------
// 페이지 콘텐츠 · FAQ · 입학안내 수치 (10단계)
// ---------------------------------------------------------------------------

/**
 * 페이지 콘텐츠 변경.
 *
 * `pageKey` 는 공개 경로의 세그먼트와 같게 맞춰 두었다. (`about` → `/about`)
 * 그래서 여기서 경로를 표로 다시 적지 않는다. 두 곳에 적으면 갈라진다.
 */
export function revalidatePageContent(pageKey: string): void {
  revalidate(`/${pageKey}`);
}

/**
 * FAQ 변경.
 * 질문·답변은 FAQ 페이지에만 나온다. 메인이나 다른 페이지에는 노출되지 않는다.
 */
export function revalidateFaq(): void {
  revalidate("/faq");
}

/**
 * 입학안내 수치(등록금·수수료·개강) 변경.
 *
 * 금액은 등록금 표뿐 아니라 **입학절차 설명과 비고 문구에도 들어간다.**
 * 다만 그 문구는 관리자가 직접 쓴 텍스트이므로 수치를 바꿔도 자동으로 따라오지 않는다.
 * 화면에서 값을 읽는 곳은 입학안내 한 페이지뿐이라 여기만 무효화한다.
 */
export function revalidateAdmissionNumbers(): void {
  revalidate("/admission");
}
