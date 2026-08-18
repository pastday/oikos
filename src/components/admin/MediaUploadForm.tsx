"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AdminFormMessage } from "@/components/admin/ui";
import { LangSection, TextAreaField } from "@/components/admin/form";
import {
  ACCEPT_ATTRIBUTE,
  formatBytes,
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  UPLOAD_HELP,
} from "@/lib/media/validation";
import type { CmsFormState } from "@/lib/cms/validation";

const INITIAL_STATE: CmsFormState = { status: "idle" };

/**
 * 파일 업로드 폼.
 *
 * `accept` 와 아래 크기 안내는 **편의 장치일 뿐**이다.
 * 실제 판정은 서버가 파일 내용(magic bytes)을 보고 한다.
 * 그래서 브라우저 검사를 우회해 올려도 통과하지 못한다.
 */
export function MediaUploadForm({
  action,
}: {
  action: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const [picked, setPicked] = useState<{ name: string; size: number } | null>(
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <section className="rounded-lg border border-line bg-background px-5 py-5">
        <label
          htmlFor="media-file"
          className="text-sm font-semibold text-navy"
        >
          파일<span className="ml-1 text-xs text-gold">필수</span>
        </label>

        <input
          id="media-file"
          name="file"
          type="file"
          required
          accept={ACCEPT_ATTRIBUTE}
          disabled={isPending}
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPicked(file ? { name: file.name, size: file.size } : null);
          }}
          className="mt-2 block w-full rounded-md border border-line bg-background px-3.5 py-2.5 text-sm text-foreground file:mr-4 file:rounded file:border-0 file:bg-navy file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white disabled:cursor-not-allowed disabled:bg-surface"
        />

        <p className="mt-2 text-xs leading-relaxed text-muted">
          {UPLOAD_HELP} 이미지 최대 {formatBytes(MAX_IMAGE_BYTES)}, PDF 최대{" "}
          {formatBytes(MAX_PDF_BYTES)}.
          <br />
          SVG 는 스크립트를 품을 수 있어 받지 않습니다.
        </p>

        {picked && (
          <p className="mt-3 rounded-md border border-line bg-surface px-4 py-2.5 text-xs text-foreground/80">
            선택한 파일: <strong>{picked.name}</strong> ({formatBytes(picked.size)})
          </p>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <LangSection lang="ko">
          <TextAreaField
            name="altKo"
            label="대체 텍스트"
            hint="이미지의 내용을 짧게 설명합니다. 화면을 읽어 주는 프로그램이 사용합니다. 장식용 이미지나 PDF 는 비워 두어도 됩니다."
            rows={3}
            disabled={isPending}
          />
        </LangSection>

        <LangSection lang="en">
          <TextAreaField
            name="altEn"
            label="Alt text"
            hint="비워 두면 영문 화면에서도 한국어 설명이 쓰입니다."
            rows={3}
            disabled={isPending}
          />
        </LangSection>
      </div>

      {state.status === "error" && (
        <AdminFormMessage tone="error" message={state.message} />
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center rounded-md bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:bg-muted"
        >
          {isPending ? "올리는 중…" : "업로드"}
        </button>
        <Link
          href="/admin/media"
          className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
