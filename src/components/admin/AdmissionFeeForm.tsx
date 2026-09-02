"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AdminFormMessage } from "@/components/admin/ui";
import type { AdmissionFeeSettings } from "@/lib/cms/admission-fee";
import type { CmsFormState } from "@/lib/cms/validation";

/**
 * 입학허가비 및 납부계좌 관리. (`/admin/pages/admission` 에서 입학안내 수치 폼 아래에 그린다)
 *
 * ## 저장 실패 시 입력값 유지 (지시 5·27항)
 *
 * `<form onSubmit>` + `startTransition(() => formAction(fd))` 방식으로 React 19 의
 * 폼 자동 reset 을 피한다. 모든 값을 이 컴포넌트 state 로 들고 있어, 검증 실패로
 * 다시 그려져도 관리자가 입력한 값이 그대로 남는다. (`ResourceForm` 과 같은 패턴)
 *
 * ## 계좌번호
 *
 * 전화번호 포맷 함수를 쓰지 않는다. 은행마다 형식이 달라 **입력한 문자열 그대로** 저장한다.
 * (서버가 앞뒤 공백만 trim)
 */

const INITIAL_STATE: CmsFormState = { status: "idle" };
const controlClassName =
  "w-full rounded-md border border-line bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted/60 focus:border-navy-soft disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted";

function formatWon(raw: string): string | null {
  const value = Number(raw.trim());
  if (!raw.trim() || !Number.isInteger(value) || value <= 0) return null;
  return `${value.toLocaleString("en-US")}원`;
}

export function AdmissionFeeForm({
  action,
  values,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  values: AdmissionFeeSettings;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const amountId = useId();
  const bankId = useId();
  const holderId = useId();
  const accountId = useId();
  const enabledId = useId();

  const [amount, setAmount] = useState(values.amount);
  const [bank, setBank] = useState(values.bank);
  const [accountHolder, setAccountHolder] = useState(values.accountHolder);
  const [accountNumber, setAccountNumber] = useState(values.accountNumber);
  const [enabled, setEnabled] = useState(values.enabled);

  const preview = formatWon(amount);

  useEffect(() => {
    if (state.status !== "error") return;
    const root = formRef.current;
    const field = state.field;
    const target =
      (field && root
        ? root.querySelector<HTMLElement>(`[name="${field}"]`)
        : null) ?? alertRef.current;
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
    if (target && target !== alertRef.current) {
      window.setTimeout(() => target.focus?.(), 300);
    }
  }, [state]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || !formRef.current) return;
    startTransition(() => formAction(new FormData(formRef.current!)));
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="rounded-lg border border-line bg-background px-5 py-5"
    >
      <h2 className="text-sm font-semibold text-navy">
        입학허가비 및 납부계좌
      </h2>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">
        입학안내 페이지에는 <strong>금액과 절차만</strong> 표시되고, 은행·예금주·계좌번호는
        온라인 입학신청 <strong>최종 제출 성공 화면</strong>에서만 지원자에게 안내됩니다.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={amountId} className="text-sm font-semibold text-navy">
            입학허가비
            <span className="ml-1 text-xs text-gold">필수</span>
          </label>
          <input
            id={amountId}
            name="amount"
            type="text"
            inputMode="numeric"
            value={amount}
            maxLength={15}
            disabled={isPending}
            onChange={(event) =>
              setAmount(event.target.value.replace(/[^\d]/g, ""))
            }
            className={controlClassName}
          />
          <p className="text-xs leading-relaxed text-muted">
            숫자만 입력합니다. 예: 480000{" "}
            {preview && (
              <span className="font-semibold text-navy">→ {preview}</span>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={bankId} className="text-sm font-semibold text-navy">
            은행명
            <span className="ml-1 text-xs text-gold">필수</span>
          </label>
          <input
            id={bankId}
            name="bank"
            type="text"
            value={bank}
            maxLength={80}
            disabled={isPending}
            onChange={(event) => setBank(event.target.value)}
            className={controlClassName}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={holderId} className="text-sm font-semibold text-navy">
            예금주
            <span className="ml-1 text-xs text-gold">필수</span>
          </label>
          <input
            id={holderId}
            name="accountHolder"
            type="text"
            value={accountHolder}
            maxLength={80}
            disabled={isPending}
            onChange={(event) => setAccountHolder(event.target.value)}
            className={controlClassName}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={accountId} className="text-sm font-semibold text-navy">
            계좌번호
            <span className="ml-1 text-xs text-gold">필수</span>
          </label>
          <input
            id={accountId}
            name="accountNumber"
            type="text"
            value={accountNumber}
            maxLength={80}
            disabled={isPending}
            onChange={(event) => setAccountNumber(event.target.value)}
            className={controlClassName}
          />
          <p className="text-xs leading-relaxed text-muted">
            입력한 그대로 저장·표시됩니다. 예: 110-420-719549
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <input
            id={enabledId}
            name="enabled"
            type="checkbox"
            checked={enabled}
            disabled={isPending}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-4 w-4 accent-navy"
          />
          <label
            htmlFor={enabledId}
            className="text-sm font-semibold text-navy"
          >
            납부 안내 표시
          </label>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          체크를 해제하면 입학안내의 입학허가비 안내 영역과 최종 제출 후 계좌정보 영역이
          숨겨집니다. 입학신청 자체와 접수번호 안내는 그대로 동작합니다.
        </p>
      </div>

      <div ref={alertRef} tabIndex={-1}>
        {state.status === "saved" && (
          <div className="mt-4">
            <AdminFormMessage tone="success" message="저장되었습니다." />
          </div>
        )}
        {state.status === "error" && (
          <div className="mt-4">
            <AdminFormMessage tone="error" message={state.message} />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-5 inline-flex justify-center rounded-md bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:bg-muted"
      >
        {isPending ? "저장 중…" : "저장"}
      </button>
    </form>
  );
}
