import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

/**
 * B안(디자인 비교 시안) 전용 경로 규칙.
 *
 * ## 왜 별도 함수를 두는가
 *
 * A안은 `localePath(locale, "/about")` → `/ko/about` 을 쓴다.
 * B안은 같은 페이지가 `/ko/design-b/about` 에 있으므로 링크를 만드는 규칙이 다르다.
 *
 * **B안 안에서는 이 함수만 쓴다.** 한 곳이라도 `localePath` 를 쓰면 그 링크만
 * A안으로 빠져나가 교수가 B안을 둘러보다 갑자기 A안 디자인을 보게 된다.
 * (13단계 지시 24항)
 *
 * 데이터·CMS·Server Action 은 A안과 똑같은 것을 쓴다. 갈라지는 것은 경로뿐이다.
 */

/** 공개 URL 에 들어가는 B안 세그먼트. 정식 승격 시 이 값만 지우면 된다. */
export const DESIGN_B_SEGMENT = "design-b";

/**
 * B안 경로를 만든다. 예: ("ko", "/about") -> "/ko/design-b/about"
 *
 * @param path locale 과 design-b 를 제외한 경로. 홈은 "" 를 넘긴다.
 */
export function bPath(locale: Locale, path: string): string {
  return `/${locale}/${DESIGN_B_SEGMENT}${path}`;
}

// ---------------------------------------------------------------------------
// 상단 메뉴
// ---------------------------------------------------------------------------

/**
 * B안 상단 메뉴.
 *
 * A안(`mainNavItems`)과 순서·대상 페이지가 같고 **FAQ 만 추가**했다.
 * A안은 FAQ 를 학위·입학안내 페이지 안에서 연결하지만, B안은 상단에 노출한다.
 * (13단계 지시 9항)
 *
 * 라벨은 새로 만들지 않고 기존 사전에서 가져온다. FAQ 는 `nav` 에 키가 없어
 * 같은 뜻으로 이미 확정되어 있는 `pages.faq.title` 을 쓴다.
 */
const navSpecs = [
  { key: "home", path: "" },
  { key: "about", path: "/about" },
  { key: "faculty", path: "/faculty" },
  { key: "programs", path: "/programs" },
  { key: "degree", path: "/degree" },
  { key: "admission", path: "/admission" },
  { key: "faq", path: "/faq" },
  { key: "consultation", path: "/consultation" },
] as const;

export type BNavItem = {
  key: string;
  href: string;
  label: string;
};

export function getBNav(locale: Locale, dict: Dictionary): BNavItem[] {
  return navSpecs.map((item) => ({
    key: item.key,
    href: bPath(locale, item.path),
    label: item.key === "faq" ? dict.pages.faq.title : dict.nav[item.key],
  }));
}

/**
 * 현재 경로가 그 메뉴에 속하는지 판단한다.
 * HOME 은 정확히 일치할 때만 활성이고, 하위 경로에서는 상위 메뉴가 활성이 된다.
 * (`/ko/design-b/programs/mba` 에서 "MBA · DBA 과정" 이 활성)
 */
export function isBNavActive(pathname: string, item: BNavItem): boolean {
  const home = item.href.endsWith(`/${DESIGN_B_SEGMENT}`);
  if (home) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
