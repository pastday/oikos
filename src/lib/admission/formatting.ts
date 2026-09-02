/**
 * 입학신청 폼의 **순수 포맷·정규화 함수**. (입학신청 폼 UX 정비)
 *
 * ## 왜 별도 파일인가
 *
 * 전화번호·주민등록번호는 "사용자는 숫자만 입력, 화면은 자동 포맷, 서버는 정규화" 원칙을 따른다.
 * 그 규칙을 **폼(클라이언트)과 서버 액션이 함께** 봐야 한다.
 * `crypto.ts` 는 `node:crypto` 를 불러 서버 전용이고, `form-config.ts` 는 오류 코드·업로드 칸
 * 정의가 목적이다. 그래서 문자열 가공만 여기 모은다. **이 파일은 순수 함수뿐이다.**
 *
 * 주민등록번호 정규화·포맷 함수는 원래 `crypto.ts` 에 있었으나 `node:crypto` 의존이 없어
 * 이리로 옮겼다. `crypto.ts` 가 다시 export 하므로 기존 import 경로는 그대로 동작한다.
 */

// ---------------------------------------------------------------------------
// 공통
// ---------------------------------------------------------------------------

/** 숫자 이외의 문자를 모두 제거한다. 붙여넣기한 값의 하이픈·공백·괄호를 걷어낸다. */
export function digitsOnly(input: string): string {
  return input.replace(/\D/g, "");
}

// ---------------------------------------------------------------------------
// 전화번호
// ---------------------------------------------------------------------------

/**
 * 국내 전화번호를 일반적인 하이픈 형식으로 만든다. **입력 중에도 자연스럽게 동작한다.**
 *
 *  - `02` (서울)      → `02-XXX-XXXX` / `02-XXXX-XXXX`
 *  - `0505` `070` `01X` → `XXX-XXXX-XXXX` (3자리 국번)
 *  - `1588` 등 대표번호 → `XXXX-XXXX`
 *  - 그 외 지역번호     → `0XX-XXX-XXXX` / `0XX-XXXX-XXXX`
 *
 * 자릿수가 모자라면 있는 만큼만 끊어 준다. (예: `0107` → `010-7`)
 */
export function formatKoreanPhone(value: string): string {
  const digits = digitsOnly(value).slice(0, 11);
  if (digits.length === 0) return "";

  // 대표번호(15XX·16XX·18XX)는 지역번호가 없다.
  if (/^(1[568]\d\d)/.test(digits) && !digits.startsWith("15000")) {
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
  }

  // 서울(02): 국번이 2자리다.
  if (digits.startsWith("02")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    }
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  // 나머지(010·011·031·0505·070…): 앞 3자리가 국번 묶음이다.
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

/**
 * 저장용 전화번호. 화면 표시와 같은 형식(`010-7794-2288`)으로 맞춘다.
 *
 * `+` 로 시작하면 국제번호로 보고 `+` 와 숫자만 남긴다. (기존 검증이 국제번호를 허용한다)
 * 그 외에는 숫자만 뽑아 국내 형식으로 포맷한다. 숫자가 없으면 원본을 그대로 돌려
 * 검증(`phoneField`) 이 "required" 로 잡게 둔다.
 */
export function normalizePhoneForStorage(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) {
    const digits = digitsOnly(trimmed);
    return digits.length > 0 ? `+${digits}` : trimmed;
  }
  const digits = digitsOnly(trimmed);
  if (digits.length === 0) return trimmed;
  return formatKoreanPhone(digits);
}

// ---------------------------------------------------------------------------
// 주민등록번호
// ---------------------------------------------------------------------------

/** 주민등록번호는 하이픈을 뺀 13자리 숫자다. */
const RESIDENT_NUMBER_DIGITS = 13;

/**
 * 입력에서 숫자만 남긴다. 하이픈·공백을 어떻게 넣든 같은 값으로 저장된다.
 * 13자리가 아니면 null. (검증은 호출하는 쪽에서 오류 코드로 바꾼다)
 */
export function normalizeResidentNumber(input: string): string | null {
  const digits = digitsOnly(input);
  return digits.length === RESIDENT_NUMBER_DIGITS ? digits : null;
}

/** 13자리 숫자를 `900101-1234567` 형태로 만든다. 인쇄 화면에서만 쓴다. */
export function formatResidentNumber(digits: string): string {
  if (digits.length !== RESIDENT_NUMBER_DIGITS) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}

/**
 * 주민등록번호 입력용 부분 포맷. 앞 6자리 뒤에 하이픈을 넣는다.
 * 입력 중(`9001` → `9001`)에도, 붙여넣기(`900101 1234567`)에도 동작한다.
 */
export function formatResidentNumberInput(value: string): string {
  const digits = digitsOnly(value).slice(0, RESIDENT_NUMBER_DIGITS);
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}

// ---------------------------------------------------------------------------
// 학력 · 경력 기간
// ---------------------------------------------------------------------------

/** 재직 중을 나타내는 표시값. 로케일별로 종료일 자리에 들어간다. */
export const CAREER_ONGOING_LABEL: Record<"ko" | "en", string> = {
  ko: "재직중",
  en: "present",
};

/**
 * 시작일 · 종료일을 기존 `period` 문자열 한 칸으로 조합한다.
 *
 *  - 둘 다 있으면 `2015-03-01 ~ 2019-02-28`
 *  - 재직 중이면 `2015-03-01 ~ 재직중` (`ongoing` 문구는 로케일에서 받는다)
 *  - 한쪽만 있으면 있는 값만
 *  - 둘 다 없으면 빈 문자열 → 서버가 `period: null` 로 저장
 */
export function composePeriod(
  startDate: string,
  endDate: string,
  options: { current?: boolean; ongoingLabel?: string } = {},
): string {
  const start = startDate.trim();
  const end = options.current
    ? (options.ongoingLabel ?? CAREER_ONGOING_LABEL.ko)
    : endDate.trim();

  if (start && end) return `${start} ~ ${end}`;
  if (start) return start;
  if (end) return end;
  return "";
}

/** `YYYY-MM-DD` 두 값의 대소를 비교한다. 문자열 비교로 충분하다(사전식 = 날짜순). */
export function isStartAfterEnd(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return false;
  return startDate > endDate;
}
