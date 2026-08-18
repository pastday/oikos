"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { MediaThumb } from "@/components/admin/MediaThumb";
import { cn } from "@/lib/cn";

/**
 * 이미지 선택 입력.
 *
 * 올려 둔 이미지를 눌러 고르거나, 외부 주소를 직접 넣을 수도 있다.
 * 값은 언제나 **공개 URL 문자열**이며 파일시스템 경로가 아니다.
 *
 * ## 왜 모달이나 별도 asset picker 를 만들지 않았나
 *
 * 지금 고를 대상은 교수 사진 한 종류이고 파일 수도 적다.
 * 폼 안에 접었다 펴는 썸네일 목록이면 충분하고, 화면을 새로 띄우지 않아
 * 작성 중이던 다른 입력이 날아갈 위험도 없다.
 * 나중에 다른 곳(PageSection 이미지 등)에서도 `name` 만 바꿔 그대로 쓸 수 있다.
 */

export type MediaOption = {
  id: string;
  url: string;
  originalName: string;
  altKo: string | null;
};

export function MediaPicker({
  name,
  label,
  hint,
  defaultValue,
  options,
  disabled,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue: string | null;
  options: MediaOption[];
  disabled?: boolean;
}) {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const hintId = hint ? `${baseId}-hint` : undefined;

  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-navy">
        {label}
      </label>

      <div className="flex items-start gap-3">
        {value ? (
          <MediaThumb url={value} kind="image" alt="" size="sm" />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-dashed border-line bg-surface text-[0.625rem] text-muted"
          >
            없음
          </span>
        )}

        <div className="min-w-0 flex-1">
          <input
            id={inputId}
            name={name}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={disabled}
            aria-describedby={hintId}
            className="w-full rounded-md border border-line bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted/60 focus:border-navy-soft disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted"
            placeholder="/media/… 또는 https://…"
          />

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((previous) => !previous)}
              disabled={disabled}
              aria-expanded={open}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy disabled:cursor-not-allowed disabled:opacity-50"
            >
              {open ? "목록 닫기" : "미디어에서 선택"}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => setValue("")}
                disabled={disabled}
                className="text-xs font-semibold text-muted underline-offset-4 hover:text-navy hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                선택 해제
              </button>
            )}
          </div>
        </div>
      </div>

      {hint && (
        <p id={hintId} className="text-xs leading-relaxed text-muted">
          {hint}
        </p>
      )}

      {open && (
        <div className="mt-2 rounded-lg border border-line bg-surface p-4">
          {options.length === 0 ? (
            <p className="text-xs text-muted">
              올려 둔 이미지가 없습니다.{" "}
              <Link
                href="/admin/media/new"
                className="font-semibold text-navy underline-offset-4 hover:underline"
              >
                파일 올리기
              </Link>
            </p>
          ) : (
            <>
              <p className="mb-3 text-xs text-muted">
                눌러서 선택합니다. 새 파일은{" "}
                <Link
                  href="/admin/media/new"
                  className="font-semibold text-navy underline-offset-4 hover:underline"
                >
                  미디어
                </Link>{" "}
                에서 먼저 올립니다.
              </p>

              <ul className="grid max-h-72 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
                {options.map((option) => {
                  const selected = option.url === value;

                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        onClick={() => setValue(option.url)}
                        disabled={disabled}
                        aria-pressed={selected}
                        title={option.originalName}
                        className={cn(
                          "flex w-full flex-col items-center gap-1.5 rounded-md border p-2 transition-colors disabled:cursor-not-allowed",
                          selected
                            ? "border-navy bg-navy-tint"
                            : "border-line bg-background hover:border-navy",
                        )}
                      >
                        <MediaThumb
                          url={option.url}
                          kind="image"
                          alt={option.altKo ?? ""}
                          size="sm"
                        />
                        <span className="w-full truncate text-[0.625rem] text-muted">
                          {option.originalName}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
