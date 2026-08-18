"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AdminFormMessage } from "@/components/admin/ui";
import {
  CheckboxField,
  LangSection,
  NumberField,
  SelectField,
  SettingsSection,
  TextAreaField,
  TextField,
} from "@/components/admin/form";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { SectionItemSpec, SlotSpec } from "@/lib/cms/page-catalog";
import type { MediaChoice } from "@/lib/media/select";
import type { CmsFormState } from "@/lib/cms/validation";

const INITIAL_STATE: CmsFormState = { status: "idle" };

/**
 * 섹션 안의 반복 항목(카드·팩트·절차·일정) 편집 폼.
 *
 * 어떤 칸을 그릴지는 카탈로그의 `SectionItemSpec` 이 정한다.
 * label 을 쓰지 않는 목록(등록금 비고)에서는 label 칸 자체를 그리지 않는다.
 */

export type PageSectionItemFormValues = {
  labelKo: string | null;
  labelEn: string | null;
  valueKo: string | null;
  valueEn: string | null;
  variant: string | null;
  mediaId: string | null;
  sortOrder: number;
  isPublished: boolean;
};

function Field({
  spec,
  name,
  defaultValue,
  hint,
  disabled,
}: {
  spec: SlotSpec;
  name: string;
  defaultValue: string | null;
  hint?: string;
  disabled: boolean;
}) {
  return spec.multiline ? (
    <TextAreaField
      name={name}
      label={spec.label}
      hint={hint ?? spec.hint}
      defaultValue={defaultValue}
      rows={4}
      disabled={disabled}
    />
  ) : (
    <TextField
      name={name}
      label={spec.label}
      hint={hint ?? spec.hint}
      defaultValue={defaultValue}
      maxLength={5000}
      disabled={disabled}
    />
  );
}

const EN_HINT = "비워 두면 영문 페이지에서 한국어 내용이 그대로 표시됩니다.";

export function PageSectionItemForm({
  action,
  spec,
  values,
  submitLabel,
  cancelHref,
  imageChoices,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  spec: SectionItemSpec;
  values: PageSectionItemFormValues;
  submitLabel: string;
  cancelHref: string;
  /** 이 목록이 이미지를 쓸 때만 채워진다 */
  imageChoices: MediaChoice[];
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <SettingsSection title="표시 설정">
        <NumberField
          name="sortOrder"
          label="표시순서"
          hint="작은 숫자가 먼저 표시됩니다."
          defaultValue={values.sortOrder}
          min={-9999}
          max={9999}
          disabled={isPending}
        />

        {spec.variants && (
          <SelectField
            name="variant"
            label="표시 형태"
            defaultValue={values.variant ?? spec.variants[0]?.value}
            options={spec.variants}
            disabled={isPending}
          />
        )}

        <CheckboxField
          name="isPublished"
          label="홈페이지에 표시"
          hint="체크를 해제하면 이 항목만 공개 페이지에서 사라집니다."
          defaultChecked={values.isPublished}
          disabled={isPending}
        />

        {spec.image && (
          <MediaPicker
            name="mediaId"
            kind="image"
            label={spec.image.label}
            hint={spec.image.hint}
            defaultValue={values.mediaId}
            options={imageChoices}
            disabled={isPending}
          />
        )}
      </SettingsSection>

      <div className="grid gap-5 xl:grid-cols-2">
        <LangSection lang="ko">
          {spec.label && (
            <Field
              spec={spec.label}
              name="labelKo"
              defaultValue={values.labelKo}
              disabled={isPending}
            />
          )}
          {spec.value && (
            <Field
              spec={spec.value}
              name="valueKo"
              defaultValue={values.valueKo}
              disabled={isPending}
            />
          )}
        </LangSection>

        <LangSection lang="en">
          {spec.label && (
            <Field
              spec={spec.label}
              name="labelEn"
              defaultValue={values.labelEn}
              hint={EN_HINT}
              disabled={isPending}
            />
          )}
          {spec.value && (
            <Field
              spec={spec.value}
              name="valueEn"
              defaultValue={values.valueEn}
              hint={EN_HINT}
              disabled={isPending}
            />
          )}
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
          href={cancelHref}
          className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
