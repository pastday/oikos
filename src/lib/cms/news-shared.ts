/**
 * 학교소식에서 **서버·클라이언트가 함께 쓰는 순수 함수**.
 *
 * `lib/cms/news.ts` 는 prisma 를 import 하므로 클라이언트 컴포넌트(관리자 폼)에서
 * 불러올 수 없다. slug 정규화·YouTube URL 파싱은 폼(미리보기)과 서버(저장 검증)가
 * 모두 필요로 하므로 의존성 없는 이 파일에 둔다. `news.ts` 가 그대로 재수출한다.
 */

/**
 * 제목에서 URL slug 를 만든다.
 *
 * 소문자로 바꾸고, 문자(한글 포함)·숫자를 제외한 것은 `-` 로 치환한 뒤
 * 연속 하이픈을 하나로, 앞뒤 하이픈을 제거한다.
 *
 *   "Degree conferment ceremony" → "degree-conferment-ceremony"
 *   "MBA Orientation 2026"       → "mba-orientation-2026"
 *
 * 한글만 있는 제목은 한글 slug 가 된다. 브라우저가 percent-encoding 해서 정상 동작하며
 * 국내 사이트에서 흔하다. 관리자가 직접 입력한 값도 이 함수를 거쳐 정규화하므로,
 * "Degree conferment ceremony" 를 그대로 입력해도 오류 없이 위 형태로 저장된다.
 */
export function slugifyNews(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/**
 * YouTube URL 에서 **11자리 video ID** 를 안전하게 추출한다. 아니면 `null`.
 *
 * 임의 URL 을 iframe src 에 그대로 넣지 않기 위해, 저장·표시 양쪽에서 이 함수로
 * ID 를 먼저 뽑고 `https://www.youtube.com/embed/<id>` 를 직접 만든다. (지시 3항)
 *
 * 지원: youtube.com/watch?v=ID · youtu.be/ID · youtube.com/embed/ID ·
 *       youtube.com/shorts/ID · youtube.com/live/ID (www / m / -nocookie 포함)
 */
export function parseYouTubeId(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "").toLowerCase();
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.split("/")[1] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else if (["embed", "shorts", "live", "v"].includes(parts[0] ?? "")) {
      id = parts[1] ?? null;
    }
  }

  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
  return id;
}

/** 검증된 video ID 로 embed 주소를 만든다. */
export function youTubeEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/${id}`;
}
