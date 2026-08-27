"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useActionState } from "react";
import { AdminFormMessage } from "@/components/admin/ui";
import {
  CheckboxField,
  DateField,
  LangSection,
  NumberField,
  SettingsSection,
  TextAreaField,
  TextField,
  UrlField,
} from "@/components/admin/form";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { MediaChoice } from "@/lib/media/select";
import type { CmsFormState } from "@/lib/cms/validation";

/**
 * 교수의 **주요 저서** · **언론 · 미디어** 입력 폼. (15단계)
 *
 * 두 폼은 담는 값이 달라 필드를 합치지 않았다. 대신 바깥 껍데기(설정 묶음 위치,
 * 저장 결과 안내, 버튼 줄)는 `WorkFormShell` 하나를 함께 쓴다.
 * `FacultyForm` 과 같은 구성으로 맞춰 두어 관리자가 화면을 옮겨 다녀도 위치가 같다.
 *
 * ## 이미지 칸에 대한 안내를 폼 안에 적어 둔다
 *
 * 서점 표지나 기사 사진을 내려받아 올리면 안 된다는 것은 **코드가 막을 수 없는 규칙**이다.
 * 그래서 고르는 자리 바로 옆에 적는다. (CLAUDE.md 22항)
 */

const INITIAL_STATE: CmsFormState = { status: "idle" };

/** 사용권이 확인된 파일만 연결해야 한다는 안내. 두 폼이 같은 문장을 쓴다. */
const MEDIA_RIGHTS_HINT =
  "[미디어] 에 올린 이미지 중에서 고릅니다. 사용권이 확인된 이미지만 등록하세요. 서점·언론사 이미지를 내려받아 올리지 않습니다. 비워 두면 이미지 없이 표시됩니다.";

const SORT_HINT = "작은 숫자가 위에 표시됩니다.";
const PUBLISH_HINT = "체크를 해제하면 공개 페이지에서 사라집니다.";
const TITLE_EN_HINT = "비워 두면 영문 페이지에서도 한국어 원표기가 표시됩니다.";
const DATE_HINT = "확인된 날짜만 입력하세요. 모르면 비워 둡니다.";

function WorkFormShell({
  action,
  submitLabel,
  cancelHref,
  children,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  submitLabel: string;
  cancelHref: string;
  /** `isPending` 을 받아 필드를 그린다. 저장 중에는 전부 잠긴다. */
  children: (isPending: boolean) => ReactNode;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {children(isPending)}

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

/** 한국어 / English 를 나란히 놓는 묶음. `FacultyForm` 의 `FormGroup` 과 같은 모양이다. */
function LangGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-1 text-sm font-semibold text-navy">{title}</legend>
      <div className="grid gap-5 xl:grid-cols-2">{children}</div>
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// 주요 저서
// ---------------------------------------------------------------------------

export type FacultyBookFormValues = {
  titleKo: string;
  titleEn: string | null;
  subtitleKo: string | null;
  subtitleEn: string | null;
  authorKo: string | null;
  authorEn: string | null;
  publisherKo: string | null;
  publisherEn: string | null;
  /** `YYYY-MM-DD` 또는 빈 문자열. `<input type="date">` 가 이 형식만 받는다. */
  publishedAt: string;
  isbn: string | null;
  descriptionKo: string | null;
  descriptionEn: string | null;
  externalUrl: string | null;
  coverMediaId: string | null;
  sortOrder: number;
  isPublished: boolean;
};

export function FacultyBookForm({
  action,
  values,
  submitLabel,
  cancelHref,
  mediaOptions,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  values: FacultyBookFormValues;
  submitLabel: string;
  cancelHref: string;
  mediaOptions: MediaChoice[];
}) {
  return (
    <WorkFormShell
      action={action}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
    >
      {(isPending) => (
        <>
          <SettingsSection title="서지 정보 및 표시 설정">
            <DateField
              name="publishedAt"
              label="발행일"
              hint={DATE_HINT}
              defaultValue={values.publishedAt}
              disabled={isPending}
            />
            <TextField
              name="isbn"
              label="ISBN"
              hint="원본에 적힌 그대로 입력하세요. 숫자와 하이픈만 됩니다."
              defaultValue={values.isbn}
              maxLength={20}
              disabled={isPending}
            />
            <UrlField
              name="externalUrl"
              label="도서 링크"
              hint="서점 또는 출판사의 도서 페이지 주소입니다. 비워 두면 [도서 보기] 링크를 표시하지 않습니다."
              defaultValue={values.externalUrl}
              disabled={isPending}
            />
            <NumberField
              name="sortOrder"
              label="표시순서"
              hint={SORT_HINT}
              defaultValue={values.sortOrder}
              min={-9999}
              max={9999}
              disabled={isPending}
            />
            <MediaPicker
              name="coverMediaId"
              label="표지 이미지"
              kind="image"
              hint={MEDIA_RIGHTS_HINT}
              defaultValue={values.coverMediaId}
              options={mediaOptions}
              disabled={isPending}
            />
            <CheckboxField
              name="isPublished"
              label="홈페이지에 공개"
              hint={PUBLISH_HINT}
              defaultChecked={values.isPublished}
              disabled={isPending}
            />
          </SettingsSection>

          <LangGroup title="도서 정보">
            <LangSection lang="ko">
              <TextField
                name="titleKo"
                label="도서명"
                required
                defaultValue={values.titleKo}
                disabled={isPending}
              />
              <TextField
                name="subtitleKo"
                label="부제"
                hint="원본에 부제가 있을 때만 입력합니다."
                defaultValue={values.subtitleKo}
                disabled={isPending}
              />
              <TextField
                name="authorKo"
                label="저자"
                hint="공저·역서는 원본 표기를 그대로 옮깁니다."
                defaultValue={values.authorKo}
                disabled={isPending}
              />
              <TextField
                name="publisherKo"
                label="출판사"
                defaultValue={values.publisherKo}
                disabled={isPending}
              />
              <TextAreaField
                name="descriptionKo"
                label="소개"
                hint="1~3문장으로 직접 요약해 주세요. 서점의 상품설명을 그대로 옮기지 않습니다."
                rows={4}
                defaultValue={values.descriptionKo}
                disabled={isPending}
              />
            </LangSection>

            <LangSection lang="en">
              <TextField
                name="titleEn"
                label="Title"
                hint={TITLE_EN_HINT}
                defaultValue={values.titleEn}
                disabled={isPending}
              />
              <TextField
                name="subtitleEn"
                label="Subtitle"
                defaultValue={values.subtitleEn}
                disabled={isPending}
              />
              <TextField
                name="authorEn"
                label="Author"
                defaultValue={values.authorEn}
                disabled={isPending}
              />
              <TextField
                name="publisherEn"
                label="Publisher"
                hint="공식 영문 사명이 확인된 경우에만 입력하세요."
                defaultValue={values.publisherEn}
                disabled={isPending}
              />
              <TextAreaField
                name="descriptionEn"
                label="Description"
                rows={4}
                defaultValue={values.descriptionEn}
                disabled={isPending}
              />
            </LangSection>
          </LangGroup>
        </>
      )}
    </WorkFormShell>
  );
}

// ---------------------------------------------------------------------------
// 언론 · 미디어
// ---------------------------------------------------------------------------

export type FacultyArticleFormValues = {
  titleKo: string;
  titleEn: string | null;
  summaryKo: string | null;
  summaryEn: string | null;
  publisherKo: string | null;
  publisherEn: string | null;
  publishedAt: string;
  externalUrl: string | null;
  imageMediaId: string | null;
  sortOrder: number;
  isPublished: boolean;
};

export function FacultyArticleForm({
  action,
  values,
  submitLabel,
  cancelHref,
  mediaOptions,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  values: FacultyArticleFormValues;
  submitLabel: string;
  cancelHref: string;
  mediaOptions: MediaChoice[];
}) {
  return (
    <WorkFormShell
      action={action}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
    >
      {(isPending) => (
        <>
          <SettingsSection title="게시 정보 및 표시 설정">
            <DateField
              name="publishedAt"
              label="게시일"
              hint={DATE_HINT}
              defaultValue={values.publishedAt}
              disabled={isPending}
            />
            <UrlField
              name="externalUrl"
              label="기사 URL"
              hint="원문 주소입니다. 비워 두면 [기사 보기] 링크를 표시하지 않습니다."
              defaultValue={values.externalUrl}
              disabled={isPending}
            />
            <NumberField
              name="sortOrder"
              label="표시순서"
              hint={SORT_HINT}
              defaultValue={values.sortOrder}
              min={-9999}
              max={9999}
              disabled={isPending}
            />
            <MediaPicker
              name="imageMediaId"
              label="대표 이미지"
              kind="image"
              hint={MEDIA_RIGHTS_HINT}
              defaultValue={values.imageMediaId}
              options={mediaOptions}
              disabled={isPending}
            />
            <CheckboxField
              name="isPublished"
              label="홈페이지에 공개"
              hint={PUBLISH_HINT}
              defaultChecked={values.isPublished}
              disabled={isPending}
            />
          </SettingsSection>

          <LangGroup title="기사 정보">
            <LangSection lang="ko">
              <TextField
                name="titleKo"
                label="기사 제목"
                required
                defaultValue={values.titleKo}
                disabled={isPending}
              />
              <TextField
                name="publisherKo"
                label="게시처"
                hint="매체명 또는 블로그명입니다."
                defaultValue={values.publisherKo}
                disabled={isPending}
              />
              <TextAreaField
                name="summaryKo"
                label="짧은 설명"
                hint="1~2문장으로 직접 요약해 주세요. 기사 본문을 옮겨 적지 않습니다."
                rows={4}
                defaultValue={values.summaryKo}
                disabled={isPending}
              />
            </LangSection>

            <LangSection lang="en">
              <TextField
                name="titleEn"
                label="Title"
                hint={TITLE_EN_HINT}
                defaultValue={values.titleEn}
                disabled={isPending}
              />
              <TextField
                name="publisherEn"
                label="Publisher"
                hint="공식 영문 매체명이 확인된 경우에만 입력하세요."
                defaultValue={values.publisherEn}
                disabled={isPending}
              />
              <TextAreaField
                name="summaryEn"
                label="Summary"
                rows={4}
                defaultValue={values.summaryEn}
                disabled={isPending}
              />
            </LangSection>
          </LangGroup>
        </>
      )}
    </WorkFormShell>
  );
}
