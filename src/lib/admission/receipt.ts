import type { Prisma } from "@/generated/prisma/client";

/**
 * 접수번호. 예: `2026-000001`
 *
 * ## DB id 와 왜 나누는가
 *
 * `id` 는 cuid 라 사람이 읽거나 전화로 불러 줄 수 없다.
 * 접수번호는 지원자와 학교가 주고받는 번호이므로 짧고 읽을 수 있어야 한다.
 * 둘을 한 컬럼으로 합치면 URL·FK 와 대외 번호가 같은 값이 되어 나중에 형식을 못 바꾼다.
 *
 * ## 동시성
 *
 * 별도 카운터 테이블이나 시퀀스를 만들지 않는다. (지시 6항 — 복잡한 sequence 금지)
 * 대신 **`applicationNo` 에 걸린 unique 제약을 그대로 이용한다.**
 *
 *   1. 그 해의 마지막 번호를 읽어 +1 한다
 *   2. insert 한다
 *   3. 같은 순간에 다른 요청이 먼저 넣었으면 unique 위반(P2002)이 나고, 호출하는 쪽이 재시도한다
 *
 * 읽고-쓰는 사이의 경쟁을 lock 이 아니라 **제약 위반 + 재시도**로 처리하는 방식이다.
 * 입학신청은 초당 수십 건이 들어오는 폼이 아니라서 이 정도면 충분하고,
 * 무엇보다 "번호가 중복될 수 있다" 는 가능성 자체가 DB 제약으로 막혀 있다.
 */

/** 연도 뒤에 붙는 일련번호 자릿수. 0 을 채워 정렬이 곧 번호 순서가 되게 한다. */
const SEQUENCE_DIGITS = 6;

export function formatApplicationNo(year: number, sequence: number): string {
  return `${year}-${String(sequence).padStart(SEQUENCE_DIGITS, "0")}`;
}

/**
 * 그 해의 다음 접수번호를 만든다.
 *
 * 번호가 0 채움 고정 자릿수라 **문자열 내림차순 정렬이 곧 숫자 내림차순**이다.
 * 그래서 별도 계산 없이 마지막 한 건만 읽으면 된다.
 */
export async function nextApplicationNo(
  client: Prisma.TransactionClient,
  year: number,
): Promise<string> {
  const prefix = `${year}-`;

  const latest = await client.admissionApplication.findFirst({
    where: { applicationNo: { startsWith: prefix } },
    orderBy: { applicationNo: "desc" },
    select: { applicationNo: true },
  });

  const lastSequence = latest
    ? Number.parseInt(latest.applicationNo.slice(prefix.length), 10)
    : 0;

  // 번호 형식이 깨진 행이 있어도 흐름이 멈추지 않게 한다.
  const next = Number.isFinite(lastSequence) ? lastSequence + 1 : 1;

  return formatApplicationNo(year, next);
}

/** Prisma 의 unique 제약 위반인지 확인한다. 재시도 여부를 여기서 판단한다. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
