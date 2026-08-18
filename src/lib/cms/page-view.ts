import type { PageIntro } from "@/content/pages";
import type { PageItemView, PageSectionView } from "./types";

/**
 * 공개 화면이 CMS 섹션을 쓸 때 필요한 작은 변환들.
 *
 * ## 값이 없을 때의 규칙 (10단계 원칙 5)
 *
 * - **섹션 행 자체가 없으면 그 섹션을 그리지 않는다.** 페이지는 정상적으로 나온다.
 * - 섹션은 있는데 특정 슬롯이 비어 있으면 **그 부분만 그리지 않는다.**
 *   정적 콘텐츠로 되돌리지 않는다. 되돌리면 관리자가 일부러 비운 문구가
 *   되살아나 화면과 CMS 가 갈라진다.
 * - 예외는 **페이지 제목 하나뿐**이다. 제목이 없으면 h1 과 검색엔진 제목이 비어
 *   페이지가 망가지므로, 이때만 정적 콘텐츠의 제목을 쓴다.
 */

/** 페이지 상단(PageHero)이 쓰는 모양으로 바꾼다. */
export function toPageIntro(
  section: PageSectionView | undefined,
  fallback: PageIntro,
): PageIntro {
  if (!section) return fallback;

  return {
    eyebrow: section.subtitle ?? "",
    // 제목만은 비워 둘 수 없다. 위 주석 참고.
    title: section.title ?? fallback.title,
    description: section.paragraphs[0] ?? "",
  };
}

/** 라벨과 값이 모두 있는 항목만 남긴다. 한쪽만 있는 항목은 화면에서 어색하다. */
export function toPairs(
  items: PageItemView[],
): { id: string; label: string; value: string }[] {
  return items.flatMap((item) =>
    item.label && item.value
      ? [{ id: item.id, label: item.label, value: item.value }]
      : [],
  );
}

/** 값만 쓰는 목록(등록금 비고 등). */
export function toValues(items: PageItemView[]): { id: string; value: string }[] {
  return items.flatMap((item) =>
    item.value ? [{ id: item.id, value: item.value }] : [],
  );
}
