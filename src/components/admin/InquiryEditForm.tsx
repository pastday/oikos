"use client";

import { useActionState } from "react";
import { AdminFormMessage } from "@/components/admin/ui";
import type { InquiryUpdateState } from "@/app/admin/(protected)/inquiry-actions";

const INITIAL_STATE: InquiryUpdateState = { status: "idle" };

/**
 * 상태 + 관리자 메모 저장 폼.
 *
 * 상담 · 설명회 · **입학신청**(18단계)이 저장하는 값이 (status, adminMemo) 로 완전히 같아서
 * 이 화면 하나를 공유한다. 어떤 액션을 부를지는 각 상세 페이지가 넘겨준다.
 *
 * 상태 enum 은 화면마다 다르다. (`InquiryStatus` / `AdmissionStatus`)
 * 그래서 목록과 라벨을 props 로 받되 **제네릭으로 묶어** 둘이 어긋나면 컴파일 오류가 나게 한다.
 *
 * 저장 여부는 서버가 결정한다. 여기서는 결과 문구를 보여주기만 한다.
 */
export function InquiryEditForm<Status extends string>({
  id,
  action,
  statuses,
  currentStatus,
  currentMemo,
  statusLabels,
  memoHint,
}: {
  id: string;
  action: (
    state: InquiryUpdateState,
    formData: FormData,
  ) => Promise<InquiryUpdateState>;
  /** 선택지로 그릴 상태 목록. 순서가 곧 화면 순서다. */
  statuses: readonly Status[];
  currentStatus: Status;
  currentMemo: string | null;
  statusLabels: Record<Status, string>;
  memoHint: string;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={id} readOnly />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="inquiry-status"
          className="text-sm font-semibold text-navy"
        >
          처리 상태
        </label>
        <select
          id="inquiry-status"
          name="status"
          defaultValue={currentStatus}
          disabled={isPending}
          className="w-full max-w-xs rounded-md border border-line bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors focus:border-navy-soft disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted"
        >
          {statuses.map((value) => (
            <option key={value} value={value}>
              {statusLabels[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="inquiry-memo"
          className="text-sm font-semibold text-navy"
        >
          관리자 메모
        </label>
        <textarea
          id="inquiry-memo"
          name="adminMemo"
          rows={6}
          maxLength={5000}
          defaultValue={currentMemo ?? ""}
          disabled={isPending}
          aria-describedby="inquiry-memo-hint"
          className="w-full resize-y rounded-md border border-line bg-background px-3.5 py-2.5 text-sm leading-relaxed text-foreground transition-colors focus:border-navy-soft disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted"
        />
        <p id="inquiry-memo-hint" className="text-xs text-muted">
          {memoHint}
        </p>
      </div>

      {state.status === "saved" && (
        <AdminFormMessage tone="success" message="저장되었습니다." />
      )}
      {state.status === "error" && (
        <AdminFormMessage tone="error" message={state.message} />
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center rounded-md bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:bg-muted"
        >
          {isPending ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}
