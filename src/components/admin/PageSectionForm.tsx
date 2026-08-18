"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AdminFormMessage } from "@/components/admin/ui";
import {
  CheckboxField,
  LangSection,
  SettingsSection,
  TextAreaField,
  TextField,
} from "@/components/admin/form";
import type { SectionSlot, SectionSpec } from "@/lib/cms/page-catalog";
import type { CmsFormState } from "@/lib/cms/validation";

const INITIAL_STATE: CmsFormState = { status: "idle" };

/**
 * 페이지 섹션 편집 폼.
 *
 * 어떤 입력칸을 그릴지는 **카탈로그가 정한다.** 섹션마다 쓰는 슬롯이 다르므로
 * 폼을 섹션 종류마다 따로 만들지 않고 카탈로그를 읽어 그린다.
 * 화면에 없는 슬롯은 서버에서도 저장 대상이 아니다.
 */

export type PageSectionFormValues = Partial<Record<`${SectionSlot}Ko` | `${SectionSlot}En`, string | null>> & {
  isPublished: boolean;
};

function SlotFields({
  section,
  values,
  lang,
  disabled,
}: {
  section: SectionSpec;
  values: PageSectionFormValues;
  lang: "ko" | "en";
  disabled: boolean;
}) {
  const suffix = lang === "ko" ? "Ko" : "En";
  const slots = Object.entries(section.slots) as [SectionSlot, SectionSpec["slots"][SectionSlot]][];

  return (
    <>
      {slots.map(([slot, spec]) => {
        if (!spec) return null;

        const name = `${slot}${suffix}` as const;
        const value = values[name] ?? "";

        // 영어 칸의 안내는 한 번만 보여 준다. 같은 설명이 두 번 나오면 폼이 길어지기만 한다.
        const hint =
          lang === "ko"
            ? spec.hint
            : "비워 두면 영문 페이지에서 한국어 내용이 그대로 표시됩니다.";

        return spec.multiline ? (
          <TextAreaField
            key={name}
            name={name}
            label={spec.label}
            hint={hint}
            defaultValue={value}
            rows={slot === "body" ? 8 : 3}
            disabled={disabled}
          />
        ) : (
          <TextField
            key={name}
            name={name}
            label={spec.label}
            hint={hint}
            defaultValue={value}
            maxLength={5000}
            disabled={disabled}
          />
        );
      })}
    </>
  );
}

export function PageSectionForm({
  action,
  section,
  values,
  cancelHref,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  section: SectionSpec;
  values: PageSectionFormValues;
  cancelHref: string;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <SettingsSection title="표시 설정">
        <CheckboxField
          name="isPublished"
          label="홈페이지에 표시"
          hint="체크를 해제하면 이 섹션 전체가 공개 페이지에서 사라집니다."
          defaultChecked={values.isPublished}
          disabled={isPending}
        />
      </SettingsSection>

      <div className="grid gap-5 xl:grid-cols-2">
        <LangSection lang="ko">
          <SlotFields
            section={section}
            values={values}
            lang="ko"
            disabled={isPending}
          />
        </LangSection>

        <LangSection lang="en">
          <SlotFields
            section={section}
            values={values}
            lang="en"
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
          {isPending ? "저장 중…" : "저장"}
        </button>
        <Link
          href={cancelHref}
          className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          목록으로
        </Link>
      </div>
    </form>
  );
}
