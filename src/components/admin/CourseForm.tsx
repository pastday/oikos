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
import type { CmsFormState } from "@/lib/cms/validation";

const INITIAL_STATE: CmsFormState = { status: "idle" };

export type CourseFormValues = {
  programId: string;
  semester: number | null;
  credits: number | null;
  category: string;
  titleKo: string;
  titleEn: string | null;
  descriptionKo: string | null;
  descriptionEn: string | null;
  sortOrder: number;
  isPublished: boolean;
};

const categoryOptions = [
  { value: "MAJOR", label: "전공" },
  { value: "COMMON", label: "공통" },
  { value: "CHAPEL", label: "채플" },
  { value: "OTHER", label: "기타" },
];

export function CourseForm({
  action,
  values,
  programs,
  submitLabel,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  values: CourseFormValues;
  programs: { id: string; label: string }[];
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <SettingsSection title="과정 및 편성">
        <SelectField
          name="programId"
          label="과정"
          required
          defaultValue={values.programId}
          options={programs.map((program) => ({
            value: program.id,
            label: program.label,
          }))}
          disabled={isPending}
        />
        <SelectField
          name="category"
          label="구분"
          required
          defaultValue={values.category}
          options={categoryOptions}
          disabled={isPending}
        />
        <NumberField
          name="semester"
          label="학기"
          hint="비워 두면 '학기 미지정'이 되어 공개 페이지에서 '그 밖의 전공과목'으로 묶입니다. 원본에 학기 표기가 없으면 비워 두세요."
          defaultValue={values.semester}
          min={1}
          max={20}
          disabled={isPending}
        />
        <NumberField
          name="credits"
          label="학점"
          hint="비워 두면 공개 페이지에 '학점 미표기'로 표시됩니다."
          defaultValue={values.credits}
          max={30}
          disabled={isPending}
        />
        <NumberField
          name="sortOrder"
          label="표시순서"
          hint="같은 학기 안에서의 순서입니다. 작은 숫자가 먼저 표시됩니다."
          defaultValue={values.sortOrder}
          min={-9999}
          max={9999}
          disabled={isPending}
        />
        <CheckboxField
          name="isPublished"
          label="홈페이지에 공개"
          hint="해제하면 교육과정 목록에서 빠집니다."
          defaultChecked={values.isPublished}
          disabled={isPending}
        />
      </SettingsSection>

      <div className="grid gap-5 xl:grid-cols-2">
        <LangSection lang="ko">
          <TextField
            name="titleKo"
            label="교과목명"
            required
            defaultValue={values.titleKo}
            disabled={isPending}
          />
          <TextAreaField
            name="descriptionKo"
            label="교과 내용"
            hint="원본 자료에 내용이 없으면 비워 두세요. 화면에는 '교과 내용은 준비 중입니다.'로 표시됩니다."
            rows={5}
            defaultValue={values.descriptionKo}
            disabled={isPending}
          />
        </LangSection>

        <LangSection lang="en">
          <TextField
            name="titleEn"
            label="Course title"
            hint="원본에 영문 과목명이 없으면 비워 두세요. 영문 페이지에 한국어 원표기가 그대로 표시됩니다."
            defaultValue={values.titleEn}
            disabled={isPending}
          />
          <TextAreaField
            name="descriptionEn"
            label="Course description"
            rows={5}
            defaultValue={values.descriptionEn}
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
          href="/admin/courses"
          className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
