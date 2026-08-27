/**
 * 관리자 화면 표시 형식.
 *
 * ## 날짜/시간
 *
 * DB 는 `timestamp without time zone` 이고 Prisma 는 **UTC 기준 시각**을 넣는다.
 * (현재 DB·서버 timezone 모두 UTC)
 *
 * 저장값은 그대로 두고 **표시할 때만** 한국 시간으로 바꾼다.
 * `Intl.DateTimeFormat` 에 timeZone 을 명시하므로 서버의 TZ 설정이 무엇이든 결과가 같다.
 *
 * > 주의: 컬럼이 `timestamp without time zone` 이라 **서버 OS timezone 은 UTC 로 유지해야 한다.**
 * > KST 로 바꾸면 드라이버가 저장값을 다른 시각으로 해석할 수 있다.
 */

const KST = "Asia/Seoul";

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KST,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  // `hour12: false` 만 주면 자정이 "24:17" 처럼 h24 표기로 나온다. (실제로 겪음)
  // 0~23 시로 고정하려면 hourCycle 을 명시해야 한다.
  hourCycle: "h23",
});

/** 예: 2026-08-17 23:15 */
export function formatDateTime(value: Date): string {
  const parts = dateTimeFormatter.formatToParts(value);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

/** `<time datetime>` 에 넣을 값. 기계가 읽는 값이므로 UTC 원본을 그대로 쓴다. */
export function toIsoString(value: Date): string {
  return value.toISOString();
}

/**
 * `<input type="date">` 에 넣을 값. (15단계 — 저서 발행일 · 기사 게시일)
 *
 * 위의 날짜/시간과 달리 **한국 시간으로 바꾸지 않는다.** `@db.Date` 컬럼이라
 * 애초에 시각이 없는 값이고, 여기서 시간대를 한 번 더 적용하면 하루가 밀린다.
 * 값이 없는 것은 정상이며 그때는 빈 칸이 된다.
 */
export function toDateInputValue(value: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : "";
}

/** 긴 문의내용을 목록에서 한 줄로 줄여 보여준다. */
export function truncate(value: string | null, length: number): string {
  if (!value) return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > length
    ? `${normalized.slice(0, length)}…`
    : normalized;
}

/** locale 값 표시 */
export const localeLabels: Record<string, string> = {
  ko: "한국어",
  en: "English",
};
