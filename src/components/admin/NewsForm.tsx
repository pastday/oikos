"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AdminFormMessage } from "@/components/admin/ui";
import {
  CheckboxField,
  DateField,
  LangSection,
  SelectField,
  SettingsSection,
  TextAreaField,
  TextField,
} from "@/components/admin/form";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { NewsAttachmentsField } from "@/components/admin/NewsAttachmentsField";
import { newsCategoryLabels } from "@/components/admin/cms-ui";
import { newsCategories } from "@/lib/cms/validation";
import type { MediaChoice } from "@/lib/media/select";
import type { CmsFormState } from "@/lib/cms/validation";

/**
 * 학교소식 등록 · 수정. 신규와 수정이 같은 폼을 쓴다. (학교소식 지시 7·19항)
 *
 * 새 디자인 시스템을 만들지 않는다. FAQ·교수 저서 폼과 같은 조각(`SettingsSection`,
 * `LangSection`, `MediaPicker` …)을 그대로 쓴다. 구획만 지시 19항대로 나눈다.
 *   게시 설정 · 미디어 · 기본정보 · 내용
 */

const INITIAL_STATE: CmsFormState = { status: "idle" };

export type NewsFormValues = {
  slug: string | null;
  titleKo: string;
  titleEn: string | null;
  summaryKo: string | null;
  summaryEn: string | null;
  contentKo: string;
  contentEn: string | null;
  category: (typeof newsCategories)[number];
  /** `YYYY-MM-DD`. `<input type="date">` 가 이 형식만 받는다. */
  publishedAt: string;
  isPublished: boolean;
  coverMediaId: string | null;
  /** 연결된 첨부파일 Media id. 표시순서대로 */
  attachmentMediaIds: string[];
};

const CATEGORY_OPTIONS = newsCategories.map((value) => ({
  value,
  label: newsCategoryLabels[value],
}));

export function NewsForm({
  action,
  values,
  submitLabel,
  imageOptions,
  attachmentOptions,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  values: NewsFormValues;
  submitLabel: string;
  /** 대표 이미지 후보 (이미지만) */
  imageOptions: MediaChoice[];
  /** 첨부파일 후보 (이미지 · PDF) */
  attachmentOptions: MediaChoice[];
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <SettingsSection title="게시 설정">
        <DateField
          name="publishedAt"
          label="게시일"
          required
          hint="목록에서 이 날짜 기준으로 최신순 정렬됩니다."
          defaultValue={values.publishedAt}
          disabled={isPending}
        />
        <SelectField
          name="category"
          label="카테고리"
          defaultValue={values.category}
          options={CATEGORY_OPTIONS}
          disabled={isPending}
        />
        <TextField
          name="slug"
          label="주소(slug)"
          hint="상세 페이지 주소에 쓰입니다. 비워 두면 한국어 제목에서 자동 생성됩니다. 문자·숫자·하이픈만 가능합니다."
          defaultValue={values.slug}
          maxLength={120}
          disabled={isPending}
        />
        <CheckboxField
          name="isPublished"
          label="홈페이지에 공개"
          hint="체크를 해제하면 학교소식 목록·상세에서 사라지고 관리자에서만 보입니다."
          defaultChecked={values.isPublished}
          disabled={isPending}
        />
      </SettingsSection>

      <SettingsSection title="미디어">
        <MediaPicker
          name="coverMediaId"
          label="대표 이미지"
          kind="image"
          hint="[미디어] 에 올려 둔 이미지 중에서 고릅니다. 비워 두면 목록·상세에서 이미지 영역이 표시되지 않습니다."
          defaultValue={values.coverMediaId}
          options={imageOptions}
          disabled={isPending}
        />
        <NewsAttachmentsField
          options={attachmentOptions}
          defaultValue={values.attachmentMediaIds}
          disabled={isPending}
        />
      </SettingsSection>

      <div className="grid gap-5 xl:grid-cols-2">
        <LangSection lang="ko">
          <TextField
            name="titleKo"
            label="제목"
            required
            defaultValue={values.titleKo}
            disabled={isPending}
          />
          <TextAreaField
            name="summaryKo"
            label="요약"
            hint="목록 카드와 검색결과 설명에 쓰입니다. 1~2문장이면 충분합니다."
            rows={3}
            defaultValue={values.summaryKo}
            disabled={isPending}
          />
          <TextAreaField
            name="contentKo"
            label="본문"
            hint="빈 줄로 문단을 나눕니다. HTML 은 입력하지 마세요 — 그대로 글자로 표시됩니다."
            rows={12}
            defaultValue={values.contentKo}
            disabled={isPending}
          />
        </LangSection>

        <LangSection lang="en">
          <TextField
            name="titleEn"
            label="Title"
            hint="비워 두면 영문 페이지에도 한국어 제목이 표시됩니다."
            defaultValue={values.titleEn}
            disabled={isPending}
          />
          <TextAreaField
            name="summaryEn"
            label="Summary"
            hint="비워 두면 영문 목록에서 요약이 표시되지 않습니다."
            rows={3}
            defaultValue={values.summaryEn}
            disabled={isPending}
          />
          <TextAreaField
            name="contentEn"
            label="Content"
            hint="비워 두면 영문 페이지에도 한국어 본문이 표시됩니다."
            rows={12}
            defaultValue={values.contentEn}
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
          href="/admin/news"
          className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
