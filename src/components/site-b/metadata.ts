import type { Metadata } from "next";

/**
 * B안 preview 페이지의 metadata.
 *
 * ## 검색엔진에 노출하지 않는다 (13단계 지시 4·39항)
 *
 * B안은 교수 검토용 시안이다. 같은 내용의 페이지가 두 벌 색인되면
 * 정식 페이지(A안)와 중복 콘텐츠로 취급되어 A안의 검색 노출까지 나빠진다.
 *
 * 그래서 세 가지를 함께 한다.
 *  1. `robots: noindex, nofollow`
 *  2. **canonical 을 만들지 않는다.** B안 주소를 정식 주소로 선언하지 않는다.
 *  3. **hreflang 을 만들지 않는다.** root layout 이 넣어 둔 ko/en 대응 관계를
 *     빈 값으로 덮어쓴다. 그대로 두면 B안 페이지가 A안 홈을 자기 다른 언어판이라고
 *     주장하게 된다.
 *
 * sitemap 은 이 프로젝트에 아직 없으므로 넣고 뺄 대상이 없다.
 */
export function buildDesignBMetadata({
  title,
  description,
}: {
  title: string;
  description?: string;
}): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
    alternates: { canonical: null, languages: {} },
  };
}
