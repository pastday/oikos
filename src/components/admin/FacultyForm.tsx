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

/** 교수 정보. 신규 등록과 수정이 같은 폼을 쓴다. */
export type FacultyFormValues = {
  type: string;
  nameKo: string;
  nameEn: string | null;
  titleKo: string | null;
  titleEn: string | null;
  majorKo: string | null;
  majorEn: string | null;
  careerKo: string | null;
  careerEn: string | null;
  lectureFieldsKo: string | null;
  lectureFieldsEn: string | null;
  photoUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
};

const typeOptions = [
  { value: "CHIEF_PROFESSOR", label: "주임교수" },
  { value: "PROFESSOR", label: "교수" },
  { value: "VISITING_PROFESSOR", label: "객원교수" },
];

export function FacultyForm({
  action,
  values,
  submitLabel,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  values: FacultyFormValues;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <SettingsSection title="구분 및 표시 설정">
        <SelectField
          name="type"
          label="교수 구분"
          required
          defaultValue={values.type}
          options={typeOptions}
          disabled={isPending}
        />
        <NumberField
          name="sortOrder"
          label="표시순서"
          hint="작은 숫자가 위에 표시됩니다. 같으면 이름순입니다."
          defaultValue={values.sortOrder}
          min={-9999}
          max={9999}
          disabled={isPending}
        />
        <TextField
          name="photoUrl"
          label="사진 URL"
          hint="파일 업로드는 아직 지원하지 않습니다. 비워 두면 이름 이니셜로 표시됩니다."
          defaultValue={values.photoUrl}
          disabled={isPending}
        />
        <CheckboxField
          name="isPublished"
          label="홈페이지에 공개"
          hint="체크를 해제하면 공개 페이지에서 사라집니다."
          defaultChecked={values.isPublished}
          disabled={isPending}
        />
      </SettingsSection>

      <div className="grid gap-5 xl:grid-cols-2">
        <LangSection lang="ko">
          <TextField
            name="nameKo"
            label="이름"
            required
            defaultValue={values.nameKo}
            disabled={isPending}
          />
          <TextField
            name="titleKo"
            label="직책"
            defaultValue={values.titleKo}
            disabled={isPending}
          />
          <TextField
            name="majorKo"
            label="전공"
            defaultValue={values.majorKo}
            disabled={isPending}
          />
          <TextAreaField
            name="careerKo"
            label="주요 경력"
            hint="줄바꿈은 그대로 표시됩니다."
            defaultValue={values.careerKo}
            disabled={isPending}
          />
          <TextAreaField
            name="lectureFieldsKo"
            label="강의 분야"
            defaultValue={values.lectureFieldsKo}
            disabled={isPending}
          />
        </LangSection>

        <LangSection lang="en">
          <TextField
            name="nameEn"
            label="Name"
            hint="비워 두면 영문 페이지에서도 한국어 이름이 표시됩니다."
            defaultValue={values.nameEn}
            disabled={isPending}
          />
          <TextField
            name="titleEn"
            label="Position"
            defaultValue={values.titleEn}
            disabled={isPending}
          />
          <TextField
            name="majorEn"
            label="Major"
            defaultValue={values.majorEn}
            disabled={isPending}
          />
          <TextAreaField
            name="careerEn"
            label="Career"
            defaultValue={values.careerEn}
            disabled={isPending}
          />
          <TextAreaField
            name="lectureFieldsEn"
            label="Teaching areas"
            defaultValue={values.lectureFieldsEn}
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
          href="/admin/faculty"
          className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
