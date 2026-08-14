import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

/**
 * 상단 메뉴 정의. Header 와 MobileMenu 가 같은 배열을 사용해 메뉴가 중복 정의되지 않게 한다.
 * 라벨은 여기 두지 않고 locale 사전(dict.nav)에서 가져온다.
 *
 * 3단계에서는 mega menu 를 만들지 않고 대분류의 대표 페이지로만 이동한다.
 * 하위 메뉴는 4단계 이후 각 페이지 안에서 다룬다.
 */
export const mainNavItems = [
  { key: "home", path: "" },
  { key: "about", path: "/about" },
  { key: "faculty", path: "/faculty" },
  { key: "programs", path: "/programs" },
  { key: "degree", path: "/degree" },
  { key: "admission", path: "/admission" },
  { key: "consultation", path: "/consultation" },
] as const;

export type NavKey = (typeof mainNavItems)[number]["key"];

/** locale prefix 를 붙인 실제 경로를 만든다. 예: ("ko", "/about") -> "/ko/about" */
export function localePath(locale: Locale, path: string): string {
  return `/${locale}${path}`;
}

export type ResolvedNavItem = {
  key: NavKey;
  path: string;
  href: string;
  label: string;
};

export function getMainNav(
  locale: Locale,
  dict: Dictionary,
): ResolvedNavItem[] {
  return mainNavItems.map((item) => ({
    key: item.key,
    path: item.path,
    href: localePath(locale, item.path),
    label: dict.nav[item.key],
  }));
}

/**
 * 현재 경로가 해당 메뉴에 속하는지 판단한다.
 * HOME(path "") 은 완전히 일치할 때만 활성으로 본다.
 * 하위 경로(/ko/programs/mba)에서는 상위 메뉴(/ko/programs)가 활성이 된다.
 */
export function isNavItemActive(
  pathname: string,
  item: ResolvedNavItem,
): boolean {
  if (item.path === "") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Footer 의 바로가기 목록. 상단 메뉴 중 핵심 항목만 추린다. */
export const footerQuickNavKeys = [
  "about",
  "programs",
  "admission",
  "consultation",
] as const satisfies readonly NavKey[];
