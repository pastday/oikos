"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AdminFormMessage } from "@/components/admin/ui";
import { LangSection, TextAreaField } from "@/components/admin/form";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { CmsFormState } from "@/lib/cms/validation";

const INITIAL_STATE: CmsFormState = { status: "idle" };

/**
 * 미디어 상세 — 대체 텍스트 수정과 삭제.
 *
 * 삭제는 별도 폼이다. 저장 폼 안에 두면 저장 버튼과 삭제 버튼이 같은 form 을 공유해
 * 실수로 눌렀을 때 무슨 일이 벌어질지 불분명해진다.
 *
 * 삭제 결과를 `useActionState` 로 받는 이유: **사용 중이면 거절**되므로
 * 그 사유를 화면에 보여 줘야 한다. (성공하면 목록으로 redirect 되어 여기로 돌아오지 않는다)
 */
export function MediaDetailForm({
  saveAction,
  deleteAction,
  id,
  originalName,
  isImage,
  values,
}: {
  saveAction: (state: CmsFormState, formData: FormData) => Promise<CmsFormState>;
  deleteAction: (
    state: CmsFormState,
    formData: FormData,
  ) => Promise<CmsFormState>;
  id: string;
  originalName: string;
  isImage: boolean;
  values: { altKo: string | null; altEn: string | null };
}) {
  const [saveState, save, isSaving] = useActionState(saveAction, INITIAL_STATE);
  const [deleteState, remove] = useActionState(deleteAction, INITIAL_STATE);

  return (
    <div className="flex flex-col gap-6">
      <form action={save} className="flex flex-col gap-5">
        {isImage && (
          <p className="rounded-lg border border-dashed border-line bg-surface px-5 py-4 text-sm leading-relaxed text-muted">
            이미지에는 대체 텍스트를 넣어 주세요. 화면을 읽어 주는 프로그램이
            이 문구를 읽습니다. 다만 <strong>장식용 이미지</strong>라면 비워 두는 편이
            오히려 낫습니다.
          </p>
        )}

        <div className="grid gap-5 xl:grid-cols-2">
          <LangSection lang="ko">
            <TextAreaField
              name="altKo"
              label="대체 텍스트"
              defaultValue={values.altKo}
              rows={3}
              disabled={isSaving}
            />
          </LangSection>

          <LangSection lang="en">
            <TextAreaField
              name="altEn"
              label="Alt text"
              hint="비워 두면 영문 화면에서도 한국어 설명이 쓰입니다."
              defaultValue={values.altEn}
              rows={3}
              disabled={isSaving}
            />
          </LangSection>
        </div>

        {saveState.status === "saved" && (
          <AdminFormMessage tone="success" message="저장되었습니다." />
        )}
        {saveState.status === "error" && (
          <AdminFormMessage tone="error" message={saveState.message} />
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex justify-center rounded-md bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:bg-muted"
          >
            {isSaving ? "저장 중…" : "저장"}
          </button>
          <Link
            href="/admin/media"
            className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
          >
            목록으로
          </Link>
        </div>
      </form>

      <section className="border-t border-line pt-6">
        <h2 className="text-sm font-semibold text-navy">파일 삭제</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          파일과 기록을 함께 지웁니다. 되돌릴 수 없습니다. 교수진 등에서 사용 중인
          파일은 삭제되지 않으며, 어디서 쓰는지 알려 드립니다.
        </p>

        {deleteState.status === "error" && (
          <div className="mt-3">
            <AdminFormMessage tone="error" message={deleteState.message} />
          </div>
        )}

        <form action={remove} className="mt-4">
          <input type="hidden" name="id" value={id} readOnly />
          <DeleteButton
            confirmMessage={`이 파일을 삭제합니다. 되돌릴 수 없습니다.\n\n${originalName}`}
            label="파일 삭제"
          />
        </form>
      </section>
    </div>
  );
}
