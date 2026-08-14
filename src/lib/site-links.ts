/**
 * 외부 사이트 링크.
 *
 * 공식 URL 이 확인된 항목만 href 를 채운다.
 * 아직 확인되지 않은 링크는 href 를 null 로 두고, UI 에서 비활성 상태로 표시한다.
 * 임의의 URL 을 추측해서 넣지 않는다. (CLAUDE.md 23항)
 *
 * - Oikos University: 제공된 로고 자료와 주임교수 명함에 모두 www.oikos.edu 로 표기되어 있어 확정.
 *
 * TODO: FICB(세계와인기사단총연합) 공식 URL 은 제공된 자료에 없어 미확정 상태다.
 * 이후 SiteSetting DB 로 옮겨 관리자가 수정할 수 있게 한다. (CLAUDE.md 16항)
 */
export type ExternalLink = {
  key: string;
  label: string;
  href: string | null;
};

export const externalLinks: ExternalLink[] = [
  { key: "oikos", label: "Oikos University", href: "https://www.oikos.edu" },
  { key: "ficb", label: "FICB", href: null },
];
