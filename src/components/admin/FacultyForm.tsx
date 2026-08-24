"use client";

import Link from "next/link";
import type { ReactNode } from "react";
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
import type { MediaChoice } from "@/lib/media/select";
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
  bioKo: string | null;
  bioEn: string | null;
  educationKo: string | null;
  educationEn: string | null;
  careerKo: string | null;
  careerEn: string | null;
  lectureFieldsKo: string | null;
  lectureFieldsEn: string | null;
  photoMediaId: string | null;
  sortOrder: number;
  isPublished: boolean;
};

const typeOptions = [
  { value: "CHIEF_PROFESSOR", label: "주임교수" },
  { value: "PROFESSOR", label: "교수" },
  { value: "VISITING_PROFESSOR", label: "객원교수" },
];

/**
 * 목록형 항목의 입력 안내.
 *
 * 화면이 줄바꿈을 기준으로 항목을 나누므로 관리자가 그 규칙을 알아야 한다.
 * 폼 곳곳에 조금씩 다른 문장을 적으면 규칙이 흔들려 보이므로 한 문장을 돌려 쓴다.
 */
const LIST_HINT = "한 줄에 한 항목씩 입력하세요. 공개 페이지에서 목록으로 표시됩니다.";
const LIST_HINT_EN = "Enter one item per line.";
const BIO_HINT = "문단을 나눌 때는 빈 줄을 넣으세요.";
const BIO_HINT_EN = "Separate paragraphs with a blank line.";

/**
 * 폼 안의 묶음 제목.
 *
 * 교수 한 명에 입력칸이 열다섯 개가 넘어가서 무엇이 기본정보이고 무엇이 상세
 * 프로필인지 한눈에 보이지 않으면 관리자가 길을 잃는다. (14단계 지시 21항)
 *
 * `section` + 제목이 아니라 `fieldset` + `legend` 를 쓴다. 입력칸 묶음의 이름은
 * 문서 제목 체계와 별개이고, 여기서 `h2` 를 만들면 이미 `h3` 를 쓰고 있는
 * `SettingsSection`·`LangSection` 사이에 제목 단계가 뒤집혀 들어간다.
 */
function FormGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-1 text-sm font-semibold text-navy">{title}</legend>
      <div className="grid gap-5 xl:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function FacultyForm({
  action,
  values,
  submitLabel,
  mediaOptions,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  values: FacultyFormValues;
  submitLabel: string;
  /** 미디어에 올려 둔 이미지. 사진을 눌러 고를 수 있게 한다. */
  mediaOptions: MediaChoice[];
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-6">
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
        <MediaPicker
          name="photoMediaId"
          label="사진"
          kind="image"
          hint="[미디어] 에 올린 이미지 중에서 고릅니다. 비워 두면 이름 이니셜로 표시됩니다."
          defaultValue={values.photoMediaId}
          options={mediaOptions}
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

      <FormGroup title="기본 정보">
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
        </LangSection>
      </FormGroup>

      {/* 상세 프로필은 전부 선택 입력이다. 비워 두면 공개 페이지에서 그 항목만 빠진다. */}
      <FormGroup title="상세 프로필 (모두 선택 입력)">
        <LangSection lang="ko">
          <TextAreaField
            name="bioKo"
            label="교수 소개"
            hint={BIO_HINT}
            rows={5}
            defaultValue={values.bioKo}
            disabled={isPending}
          />
          <TextAreaField
            name="educationKo"
            label="학력"
            hint={LIST_HINT}
            rows={4}
            defaultValue={values.educationKo}
            disabled={isPending}
          />
          <TextAreaField
            name="careerKo"
            label="주요 경력"
            hint={LIST_HINT}
            rows={8}
            defaultValue={values.careerKo}
            disabled={isPending}
          />
          <TextAreaField
            name="lectureFieldsKo"
            label="전문분야"
            hint={LIST_HINT}
            rows={4}
            defaultValue={values.lectureFieldsKo}
            disabled={isPending}
          />
        </LangSection>

        <LangSection lang="en">
          <TextAreaField
            name="bioEn"
            label="Biography"
            hint={BIO_HINT_EN}
            rows={5}
            defaultValue={values.bioEn}
            disabled={isPending}
          />
          <TextAreaField
            name="educationEn"
            label="Education"
            hint={LIST_HINT_EN}
            rows={4}
            defaultValue={values.educationEn}
            disabled={isPending}
          />
          <TextAreaField
            name="careerEn"
            label="Professional experience"
            hint={LIST_HINT_EN}
            rows={8}
            defaultValue={values.careerEn}
            disabled={isPending}
          />
          <TextAreaField
            name="lectureFieldsEn"
            label="Areas of Expertise"
            hint={LIST_HINT_EN}
            rows={4}
            defaultValue={values.lectureFieldsEn}
            disabled={isPending}
          />
        </LangSection>
      </FormGroup>

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
