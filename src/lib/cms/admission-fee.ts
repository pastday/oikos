import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * 입학허가비 및 납부계좌 설정.
 *
 * ## 어디에 저장하는가 — 기존 `SiteSetting` 을 그대로 쓴다
 *
 * 별도 테이블(`AdmissionPayment` 등)을 만들지 않는다. 실제 결제 시스템이 아니라
 * "관리자가 고칠 수 있는 안내 문구 + 금액 + 계좌" 이므로, 등록금·수수료 수치와
 * 똑같이 `SiteSetting` key/value 에 둔다. key 이름도 기존 관례(`fee.*`, `intake.*`)를 따라
 * `admissionFee.*` 로 맞춘다. (자료실·입학안내 수치와 같은 방식)
 *
 * ## fallback — **코드 한 곳(`FALLBACK`)에서만** 관리
 *
 * 운영 DB 에 아직 값이 없을 수 있다. 그때도 입학안내·`/apply`·최종 제출·build 가
 * 절대 깨지면 안 되므로 안전한 기본값을 둔다. 관리자가 한 번 저장하면 DB 값이 쓰이고
 * 이 상수는 더 이상 사용되지 않는다. 여러 컴포넌트에 계좌정보를 복붙하지 않는다. (지시 15항)
 *
 * ## 노출 범위 (지시 20항)
 *
 * - **공개 입학안내**: 금액과 절차만. 은행·예금주·계좌번호는 `getAdmissionFeeDisplay()`
 *   가 애초에 담지 않는다.
 * - **`/apply` 작성 화면**: 아무것도. (페이지 prop 으로 넘기지 않는다)
 * - **최종 제출 성공 화면**: 전부. Server Action 이 저장 성공 뒤 `getAdmissionFeeForReceipt()`
 *   로 읽어 반환값에 실어 보낸다. (페이지 HTML 에는 들어가지 않는다)
 * - **관리자 화면**: 전부.
 */

export const ADMISSION_FEE_KEYS = {
  amount: "admissionFee.amount",
  bank: "admissionFee.bank",
  accountHolder: "admissionFee.accountHolder",
  accountNumber: "admissionFee.accountNumber",
  enabled: "admissionFee.enabled",
} as const;

/** 현재 확정된 안내 내용. DB 값이 없을 때만 쓰인다. (지시 0·3·15항) */
const FALLBACK = {
  amount: 480000,
  bank: "신한은행",
  accountHolder: "정승록",
  accountNumber: "110-420-719549",
  enabled: true,
} as const;

/** 관리자 폼이 채우는 값. 저장된 문자열 그대로(계좌번호는 trim 만). */
export type AdmissionFeeSettings = {
  amount: string;
  bank: string;
  accountHolder: string;
  accountNumber: string;
  enabled: boolean;
};

/** 공개 입학안내에 넘기는 값. **계좌정보는 담지 않는다.** */
export type AdmissionFeeDisplay = {
  enabled: boolean;
  /** 0 보다 큰 정수. 화면에서 `formatKrw` 로 표기한다. */
  amount: number;
};

/** 최종 제출 성공 화면에만 넘기는 값. 관리자가 안내를 껐으면 `null`. */
export type AdmissionFeeReceipt = {
  amount: number;
  bank: string;
  accountHolder: string;
  accountNumber: string;
};

async function readRaw(): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: Object.values(ADMISSION_FEE_KEYS) } },
    select: { key: true, value: true },
  });
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value?.trim() ?? "";
  return map;
}

/** 저장된 문자열을 정수로. 유효하지 않으면 fallback. */
function resolveAmount(raw: string | undefined): number {
  if (raw === undefined || raw.length === 0) return FALLBACK.amount;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : FALLBACK.amount;
}

/** `enabled` 는 "false" 문자열일 때만 꺼진 것으로 본다. 값이 없으면 fallback(true). */
function resolveEnabled(raw: string | undefined): boolean {
  if (raw === undefined || raw.length === 0) return FALLBACK.enabled;
  return raw !== "false";
}

/**
 * 관리자 폼 초기값. 저장된 문자열을 그대로 돌려주되, 아직 없으면 fallback 을 채워
 * 관리자가 처음부터 다시 입력하지 않아도 되게 한다.
 */
export const getAdmissionFeeSettings = cache(
  async (): Promise<AdmissionFeeSettings> => {
    const raw = await readRaw();
    return {
      amount: raw[ADMISSION_FEE_KEYS.amount] || String(FALLBACK.amount),
      bank: raw[ADMISSION_FEE_KEYS.bank] || FALLBACK.bank,
      accountHolder: raw[ADMISSION_FEE_KEYS.accountHolder] || FALLBACK.accountHolder,
      accountNumber:
        raw[ADMISSION_FEE_KEYS.accountNumber] || FALLBACK.accountNumber,
      enabled: resolveEnabled(raw[ADMISSION_FEE_KEYS.enabled]),
    };
  },
);

/** 공개 입학안내용. 금액과 활성 여부만. */
export const getAdmissionFeeDisplay = cache(
  async (): Promise<AdmissionFeeDisplay> => {
    const raw = await readRaw();
    return {
      enabled: resolveEnabled(raw[ADMISSION_FEE_KEYS.enabled]),
      amount: resolveAmount(raw[ADMISSION_FEE_KEYS.amount]),
    };
  },
);

/**
 * 최종 제출 성공 화면용. 안내가 꺼져 있으면 `null` → 화면이 계좌 영역을 그리지 않는다.
 * `cache` 를 쓰지 않는다. 제출 시점의 최신값을 매번 읽는다. (관리자가 방금 바꿨을 수 있다)
 */
export async function getAdmissionFeeForReceipt(): Promise<AdmissionFeeReceipt | null> {
  const raw = await readRaw();
  if (!resolveEnabled(raw[ADMISSION_FEE_KEYS.enabled])) return null;

  return {
    amount: resolveAmount(raw[ADMISSION_FEE_KEYS.amount]),
    bank: raw[ADMISSION_FEE_KEYS.bank] || FALLBACK.bank,
    accountHolder: raw[ADMISSION_FEE_KEYS.accountHolder] || FALLBACK.accountHolder,
    accountNumber:
      raw[ADMISSION_FEE_KEYS.accountNumber] || FALLBACK.accountNumber,
  };
}
