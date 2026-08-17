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
  TextField,
} from "@/components/admin/form";
import type { CmsFormState } from "@/lib/cms/validation";

const INITIAL_STATE: CmsFormState = { status: "idle" };

export type ProgramFormValues = {
  nameKo: string;
  nameEn: string | null;
  descriptionKo: string | null;
  descriptionEn: string | null;
  durationSemesters: number | null;
  totalCredits: number | null;
  majorCredits: number | null;
  commonCredits: number | null;
  chapelCourses: number | null;
  classMethodKo: string | null;
  classMethodEn: string | null;
  graduationRequirementsKo: string | null;
  graduationRequirementsEn: string | null;
  careerKo: string | null;
  careerEn: string | null;
  isPublished: boolean;
};

export function ProgramForm({
  action,
  values,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  values: ProgramFormValues;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <SettingsSection title="학기 및 학점">
        <NumberField
          name="durationSemesters"
          label="학위 기간 (학기)"
          hint="비워 두면 화면에 표시되지 않습니다."
          defaultValue={values.durationSemesters}
          max={20}
          disabled={isPending}
        />
        <NumberField
          name="totalCredits"
          label="총 취득학점"
          defaultValue={values.totalCredits}
          disabled={isPending}
        />
        <NumberField
          name="majorCredits"
          label="전공 학점"
          defaultValue={values.majorCredits}
          disabled={isPending}
        />
        <NumberField
          name="commonCredits"
          label="공통 학점"
          defaultValue={values.commonCredits}
          disabled={isPending}
        />
        <NumberField
          name="chapelCourses"
          label="채플 과목 수"
          hint="학점과 별도로 이수하는 과목 수입니다."
          defaultValue={values.chapelCourses}
          max={50}
          disabled={isPending}
        />
        <CheckboxField
          name="isPublished"
          label="홈페이지에 공개"
          hint="해제하면 과정 상세 페이지가 404 가 되고 메인 카드에서도 빠집니다."
          defaultChecked={values.isPublished}
          disabled={isPending}
        />
      </SettingsSection>

      <div className="grid gap-5 xl:grid-cols-2">
        <LangSection lang="ko">
          <TextField
            name="nameKo"
            label="과정명"
            required
            defaultValue={values.nameKo}
            disabled={isPending}
          />
          <TextAreaField
            name="descriptionKo"
            label="과정 설명"
            defaultValue={values.descriptionKo}
            disabled={isPending}
          />
          <TextAreaField
            name="classMethodKo"
            label="수업방식"
            rows={2}
            defaultValue={values.classMethodKo}
            disabled={isPending}
          />
          <TextAreaField
            name="graduationRequirementsKo"
            label="졸업요건"
            defaultValue={values.graduationRequirementsKo}
            disabled={isPending}
          />
          <TextAreaField
            name="careerKo"
            label="진로"
            defaultValue={values.careerKo}
            disabled={isPending}
          />
        </LangSection>

        <LangSection lang="en">
          <TextField
            name="nameEn"
            label="Program name"
            hint="비워 두면 영문 페이지에서도 한국어 과정명이 표시됩니다."
            defaultValue={values.nameEn}
            disabled={isPending}
          />
          <TextAreaField
            name="descriptionEn"
            label="Description"
            defaultValue={values.descriptionEn}
            disabled={isPending}
          />
          <TextAreaField
            name="classMethodEn"
            label="Class format"
            rows={2}
            defaultValue={values.classMethodEn}
            disabled={isPending}
          />
          <TextAreaField
            name="graduationRequirementsEn"
            label="Graduation requirements"
            defaultValue={values.graduationRequirementsEn}
            disabled={isPending}
          />
          <TextAreaField
            name="careerEn"
            label="Career paths"
            defaultValue={values.careerEn}
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
          href="/admin/programs"
          className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
