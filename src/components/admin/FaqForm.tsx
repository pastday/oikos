"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AdminFormMessage } from "@/components/admin/ui";
import {
  CheckboxField,
  LangSection,
  NumberField,
  SettingsSection,
  TextAreaField,
} from "@/components/admin/form";
import type { CmsFormState } from "@/lib/cms/validation";

const INITIAL_STATE: CmsFormState = { status: "idle" };

export type FaqFormValues = {
  questionKo: string;
  questionEn: string | null;
  answerKo: string;
  answerEn: string | null;
  sortOrder: number;
  isPublished: boolean;
};

/** FAQ 등록 · 수정. 신규와 수정이 같은 폼을 쓴다. */
export function FaqForm({
  action,
  values,
  submitLabel,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  values: FaqFormValues;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <SettingsSection title="표시 설정">
        <NumberField
          name="sortOrder"
          label="표시순서"
          hint="작은 숫자가 위에 표시됩니다. 같으면 먼저 등록한 질문이 위입니다."
          defaultValue={values.sortOrder}
          min={-9999}
          max={9999}
          disabled={isPending}
        />
        <CheckboxField
          name="isPublished"
          label="홈페이지에 공개"
          hint="체크를 해제하면 FAQ 페이지에서 사라집니다."
          defaultChecked={values.isPublished}
          disabled={isPending}
        />
      </SettingsSection>

      <div className="grid gap-5 xl:grid-cols-2">
        <LangSection lang="ko">
          <TextAreaField
            name="questionKo"
            label="질문"
            rows={2}
            defaultValue={values.questionKo}
            disabled={isPending}
          />
          <TextAreaField
            name="answerKo"
            label="답변"
            hint="줄바꿈은 그대로 표시됩니다."
            rows={8}
            defaultValue={values.answerKo}
            disabled={isPending}
          />
        </LangSection>

        <LangSection lang="en">
          <TextAreaField
            name="questionEn"
            label="Question"
            hint="비워 두면 영문 페이지에도 한국어 질문이 표시됩니다."
            rows={2}
            defaultValue={values.questionEn}
            disabled={isPending}
          />
          <TextAreaField
            name="answerEn"
            label="Answer"
            hint="비워 두면 영문 페이지에도 한국어 답변이 표시됩니다."
            rows={8}
            defaultValue={values.answerEn}
            disabled={isPending}
          />
        </LangSection>
      </div>

      {state.status === "saved" && (
        <AdminFormMessage tone="success" message="저장되었습니다." />
      )}
      {state.status === "error" && (
        <AdminFormMessage tone="error" message={state.message} />
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center rounded-md bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:bg-muted"
        >
          {isPending ? "저장 중…" : submitLabel}
        </button>
        <Link
          href="/admin/faq"
          className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
