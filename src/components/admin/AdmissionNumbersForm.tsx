"use client";

import { useActionState } from "react";
import { AdminFormMessage } from "@/components/admin/ui";
import { TextField } from "@/components/admin/form";
import { admissionNumberSpecs } from "@/lib/cms/page-catalog";
import type { CmsFormState } from "@/lib/cms/validation";

const INITIAL_STATE: CmsFormState = { status: "idle" };

/**
 * 입학안내 수치(등록금·수수료·개강 시점).
 *
 * 한국어/영어로 나누지 않는다. 숫자 하나를 저장하고 화면에서 locale 에 맞게
 * "3,000,000원" / "KRW 3,000,000" 으로 표기한다. 같은 금액을 두 번 입력하게 하면
 * 한쪽만 고쳐져 값이 갈라진다.
 */
export function AdmissionNumbersForm({
  action,
  values,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  values: Record<string, number | null>;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form
      action={formAction}
      className="rounded-lg border border-line bg-background px-5 py-5"
    >
      <h2 className="text-sm font-semibold text-navy">입학안내 수치</h2>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">
        등록금 표에 그대로 표시되는 금액입니다. 숫자만 입력하세요. 천단위 쉼표와
        원/KRW 표기는 화면에서 자동으로 붙습니다.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {admissionNumberSpecs.map((spec) => (
          <TextField
            key={spec.key}
            name={spec.key}
            label={spec.label}
            hint={spec.hint}
            defaultValue={values[spec.key] ?? ""}
            maxLength={20}
            disabled={isPending}
          />
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        ⚠️ 금액을 바꿔도 <strong>입학절차 설명과 비고에 직접 적어 둔 금액 문구는
        자동으로 바뀌지 않습니다.</strong> 아래 섹션에서 함께 고쳐 주세요.
      </p>

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

      <button
        type="submit"
        disabled={isPending}
        className="mt-5 inline-flex justify-center rounded-md bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:bg-muted"
      >
        {isPending ? "저장 중…" : "수치 저장"}
      </button>
    </form>
  );
}
