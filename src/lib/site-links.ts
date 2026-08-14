/**
 * 외부 사이트 링크.
 *
 * 공식 URL 이 확인된 항목만 href 를 채운다.
 * 아직 확인되지 않은 링크는 href 를 null 로 두고, UI 에서 비활성 상태로 표시한다.
 * 임의의 URL 을 추측해서 넣지 않는다. (CLAUDE.md 23항)
 *
 * TODO(4단계 이후): 원본 자료에서 아래 공식 URL 을 확인해 채운다.
 *   - Oikos University 미국 본교 홈페이지
 *   - FICB 홈페이지
 * 이후 SiteSetting DB 로 옮겨 관리자가 수정할 수 있게 한다. (CLAUDE.md 16항)
 */
export type ExternalLink = {
  key: string;
  label: string;
  href: string | null;
};

export const externalLinks: ExternalLink[] = [
  { key: "oikos", label: "Oikos University", href: null },
  { key: "ficb", label: "FICB", href: null },
];
