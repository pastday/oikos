"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
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
import {
  NewsLinksField,
  type NewsLinkRow,
} from "@/components/admin/NewsLinksField";
import { newsCategoryLabels } from "@/components/admin/cms-ui";
import { newsCategories } from "@/lib/cms/validation";
import { slugifyNews } from "@/lib/cms/news-shared";
import type { MediaChoice } from "@/lib/media/select";
import type { CmsFormState } from "@/lib/cms/validation";

/**
 * 학교소식 등록 · 수정. 신규와 수정이 같은 폼을 쓴다. (학교소식 지시 7·19항)
 *
 * ## 저장 실패 시 입력값이 사라지지 않게 하는 방법 (UX 정비 2항)
 *
 * 이전 구현은 `<form action={formAction}>` 였다. React 19 는 폼 액션을 실행할 때마다
 * (검증 실패로 돌아와도) `requestFormReset` 을 걸어 **비제어 입력값을 defaultValue 로
 * 되돌린다.** 그래서 slug 오류 한 번에 제목·본문이 전부 초기화됐다.
 *
 * 이제 `<form onSubmit>` 에서 `new FormData(form)` 을 직접 만들어
 * `startTransition(() => formAction(fd))` 로 부른다. React 가 폼 제출을 관리하지 않으므로
 * 리셋이 일어나지 않고, DOM 에 남은 값이 그대로 유지된다.
 * 대표 이미지·첨부파일·관련 링크는 각자 자기 state 를 가진 컴포넌트라 리렌더에도 남는다.
 * (입학신청 폼에서 쓴 방식과 같다 — `ApplyForm` 주석 참고)
 *
 * ## 구획 (지시 19항)
 *   게시 설정 · 미디어 · 한국어 · English · 관련 링크
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
  /** 관련 기사 / 외부 링크 */
  articleLinks: NewsLinkRow[];
  /** 동영상(YouTube) 링크 */
  videoLinks: NewsLinkRow[];
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
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  // slug 미리보기·자동 생성을 위해 제목/slug 만 제어 입력으로 둔다. 나머지는 비제어.
  const [titleKo, setTitleKo] = useState(values.titleKo);
  const [titleEn, setTitleEn] = useState(values.titleEn ?? "");
  const [slug, setSlug] = useState(values.slug ?? "");

  const autoSlug = useMemo(
    () => slugifyNews(titleEn.trim() || titleKo.trim()),
    [titleEn, titleKo],
  );

  // 저장 실패 시 첫 오류 필드로 스크롤·포커스한다. (지시 2항)
  useEffect(() => {
    if (state.status !== "error") return;
    const root = formRef.current;
    const field = state.field;

    const target =
      (field && root
        ? (root.querySelector<HTMLElement>(`[name="${field}"]`) ??
          root.querySelector<HTMLElement>(`[data-field="${field}"]`))
        : null) ?? alertRef.current;

    target?.scrollIntoView({ block: "center", behavior: "smooth" });
    if (target && target !== alertRef.current) {
      window.setTimeout(() => target.focus?.(), 300);
    }
  }, [state]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || !formRef.current) return;
    const formData = new FormData(formRef.current);
    startTransition(() => formAction(formData));
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6"
    >
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
        <div className="sm:col-span-2">
          <SlugField
            slug={slug}
            autoSlug={autoSlug}
            onChange={setSlug}
            disabled={isPending}
          />
        </div>
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
            value={titleKo}
            onChange={setTitleKo}
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
            value={titleEn}
            onChange={setTitleEn}
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

      <SettingsSection title="관련 링크">
        <div className="sm:col-span-2 flex flex-col gap-6">
          <NewsLinksField
            name="articleLinksJson"
            field="articleLinks"
            heading="기사 / 외부 링크"
            description="언론기사·외부 블로그 등. 상세페이지에 '관련 기사'로 표시됩니다. http:// 또는 https:// 주소만 됩니다."
            urlPlaceholder="https://example.com/article/123"
            addLabel="링크 추가"
            defaultValue={values.articleLinks}
            disabled={isPending}
          />
          <NewsLinksField
            name="videoLinksJson"
            field="videoLinks"
            heading="동영상"
            description="YouTube 주소만 지원합니다. (youtube.com/watch?v=… 또는 youtu.be/…) 상세페이지에 영상이 바로 재생되도록 표시됩니다."
            urlPlaceholder="https://www.youtube.com/watch?v=VIDEO_ID"
            addLabel="동영상 추가"
            defaultValue={values.videoLinks}
            disabled={isPending}
          />
        </div>
      </SettingsSection>

      <div ref={alertRef} tabIndex={-1}>
        {state.status === "saved" && (
          <AdminFormMessage tone="success" message="저장되었습니다." />
        )}
        {state.status === "error" && (
          <AdminFormMessage tone="error" message={state.message} />
        )}
      </div>

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

/**
 * 주소(slug) 입력.
 *
 * slug 규칙을 관리자가 몰라도 되게 만든다. 비워 두면 제목에서 자동 생성되고,
 * 무엇을 입력하든 서버가 정규화한다. 실제 주소 미리보기를 함께 보여 준다.
 */
function SlugField({
  slug,
  autoSlug,
  onChange,
  disabled,
}: {
  slug: string;
  autoSlug: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const effective = slug.trim().length > 0 ? slugifyNews(slug) : autoSlug;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        주소(slug)
      </label>
      <input
        id={id}
        name="slug"
        type="text"
        value={slug}
        maxLength={200}
        disabled={disabled}
        placeholder={autoSlug || "제목에서 자동 생성"}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-line bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted/60 focus:border-navy-soft disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted"
      />
      <p className="text-xs leading-relaxed text-muted">
        상세페이지 주소입니다. 비워두면 제목에서 자동 생성됩니다. 대문자·공백은
        자동으로 정리됩니다.
      </p>
      {effective && (
        <p className="text-xs text-muted">
          주소 미리보기:{" "}
          <code className="rounded bg-surface px-1 py-0.5 text-navy">
            /ko/news/{effective}
          </code>{" "}
          <code className="rounded bg-surface px-1 py-0.5 text-navy">
            /en/news/{effective}
          </code>
        </p>
      )}
    </div>
  );
}
