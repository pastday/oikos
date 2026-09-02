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
import { MediaMultiSelect } from "@/components/admin/MediaMultiSelect";
import { resourceCategoryLabels } from "@/components/admin/cms-ui";
import { resourceCategories } from "@/lib/cms/validation";
import { slugifyNews } from "@/lib/cms/news-shared";
import type { MediaChoice } from "@/lib/media/select";
import type { CmsFormState } from "@/lib/cms/validation";

/**
 * 자료실 등록 · 수정. 신규와 수정이 같은 폼을 쓴다. (자료실 지시 11항)
 *
 * ## 저장 실패 시 입력값 유지 (지시 13항)
 *
 * `<form onSubmit>` 에서 `new FormData(form)` 을 직접 만들어
 * `startTransition(() => formAction(fd))` 로 부른다. React 19 의 폼 자동 reset 을
 * 피하는, 학교소식 `NewsForm` 과 **완전히 같은 방식**이다.
 * 제목·slug 만 미리보기를 위해 제어 입력이고, 첨부파일은 `MediaMultiSelect` 가
 * 자체 state 로 들고 있어 리렌더에도 남는다.
 *
 * ## 구획 (지시 11항)
 *   기본 설정 · 첨부파일 · 한국어 · English
 */

const INITIAL_STATE: CmsFormState = { status: "idle" };

export type ResourceFormValues = {
  slug: string | null;
  category: (typeof resourceCategories)[number];
  titleKo: string;
  titleEn: string | null;
  summaryKo: string | null;
  summaryEn: string | null;
  contentKo: string | null;
  contentEn: string | null;
  /** `YYYY-MM-DD` */
  publishedAt: string;
  isPublished: boolean;
  /** 연결된 첨부파일 Media id. 표시순서대로 */
  attachmentMediaIds: string[];
};

const CATEGORY_OPTIONS = resourceCategories.map((value) => ({
  value,
  label: resourceCategoryLabels[value],
}));

export function ResourceForm({
  action,
  values,
  submitLabel,
  attachmentOptions,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  values: ResourceFormValues;
  submitLabel: string;
  /** `/admin/media` 의 모든 파일 */
  attachmentOptions: MediaChoice[];
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const [titleKo, setTitleKo] = useState(values.titleKo);
  const [titleEn, setTitleEn] = useState(values.titleEn ?? "");
  const [slug, setSlug] = useState(values.slug ?? "");

  const autoSlug = useMemo(
    () => slugifyNews(titleEn.trim() || titleKo.trim()),
    [titleEn, titleKo],
  );

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
      <SettingsSection title="기본 설정">
        <SelectField
          name="category"
          label="카테고리"
          hint="[입학 관련 서식] 은 입학안내 페이지 하단에도 자동으로 표시됩니다."
          defaultValue={values.category}
          options={CATEGORY_OPTIONS}
          disabled={isPending}
        />
        <DateField
          name="publishedAt"
          label="게시일"
          required
          hint="목록에서 이 날짜 기준으로 최신순 정렬됩니다."
          defaultValue={values.publishedAt}
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
          hint="체크를 해제하면 자료실·입학안내에서 사라지고 관리자에서만 보입니다."
          defaultChecked={values.isPublished}
          disabled={isPending}
        />
      </SettingsSection>

      <SettingsSection title="첨부파일">
        <div className="sm:col-span-2">
          <MediaMultiSelect
            name="attachmentMediaIds"
            label="첨부파일"
            hint="[미디어] 에 올려 둔 파일 중에서 고릅니다. 여러 개를 순서대로 붙일 수 있으며, 사용자는 각 파일을 개별적으로 내려받습니다."
            options={attachmentOptions}
            defaultValue={values.attachmentMediaIds}
            disabled={isPending}
          />
        </div>
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
            label="본문 / 설명"
            hint="빈 줄로 문단을 나눕니다. HTML 은 입력하지 마세요 — 그대로 글자로 표시됩니다."
            rows={8}
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
            rows={8}
            defaultValue={values.contentEn}
            disabled={isPending}
          />
        </LangSection>
      </div>

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
          href="/admin/resources"
          className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          취소
        </Link>
      </div>
    </form>
  );
}

/** 주소(slug) 입력. 학교소식 `NewsForm` 의 `SlugField` 와 같은 UX 다. (자료실 지시 12항) */
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
            /ko/resources/{effective}
          </code>{" "}
          <code className="rounded bg-surface px-1 py-0.5 text-navy">
            /en/resources/{effective}
          </code>
        </p>
      )}
    </div>
  );
}
