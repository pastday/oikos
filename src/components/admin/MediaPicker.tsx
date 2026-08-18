"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { MediaThumb } from "@/components/admin/MediaThumb";
import type { MediaChoice } from "@/lib/media/select";
import { cn } from "@/lib/cn";

/**
 * 미디어 선택 입력.
 *
 * 값은 **Media 의 id** 다. (12단계부터. 그 전에는 URL 문자열이었다)
 * id 로 두면 파일을 지우려 할 때 DB 가 막아 주고, 대체 텍스트도 함께 따라온다.
 * 대신 외부 사이트의 이미지 주소를 직접 넣을 수는 없다. 올린 파일만 고른다.
 *
 * ## 왜 모달이 아닌가
 *
 * 폼 안에서 접었다 펴는 목록이면 충분하고, 화면을 새로 띄우지 않아
 * 작성 중이던 다른 입력이 날아갈 위험이 없다.
 * `kind` 만 바꾸면 이미지 칸과 PDF 칸에 그대로 쓸 수 있다.
 */
export function MediaPicker({
  name,
  label,
  hint,
  defaultValue,
  options,
  kind,
  disabled,
}: {
  name: string;
  label: string;
  hint?: string;
  /** 선택된 Media id. 없으면 null */
  defaultValue: string | null;
  options: MediaChoice[];
  kind: "image" | "pdf";
  disabled?: boolean;
}) {
  const baseId = useId();
  const hintId = hint ? `${baseId}-hint` : undefined;
  const listId = `${baseId}-list`;
  const searchId = `${baseId}-search`;

  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((option) => option.id === value) ?? null;

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((option) =>
      option.originalName.toLowerCase().includes(keyword),
    );
  }, [options, query]);

  const emptyLabel = kind === "pdf" ? "선택된 문서가 없습니다" : "선택된 이미지가 없습니다";

  return (
    <div className="flex flex-col gap-1.5">
      {/* 값은 hidden input 이 나른다. 관리자가 직접 타이핑할 값이 아니다. */}
      <input type="hidden" name={name} value={value} readOnly />

      <span className="text-sm font-semibold text-navy">{label}</span>

      <div className="flex items-start gap-3">
        {selected ? (
          <MediaThumb
            url={selected.url}
            kind={selected.kind}
            alt=""
            size="sm"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-dashed border-line bg-surface text-[0.625rem] text-muted"
          >
            없음
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-foreground/85">
            {selected ? selected.originalName : emptyLabel}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((previous) => !previous)}
              disabled={disabled}
              aria-expanded={open}
              aria-controls={listId}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-50"
            >
              {open ? "목록 닫기" : kind === "pdf" ? "문서 선택" : "미디어에서 선택"}
            </button>

            {selected && (
              <button
                type="button"
                onClick={() => setValue("")}
                disabled={disabled}
                className="text-xs font-semibold text-muted underline-offset-4 transition-colors hover:text-navy hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-50"
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
        <div id={listId} className="mt-2 rounded-lg border border-line bg-surface p-4">
          {options.length === 0 ? (
            <p className="text-xs text-muted">
              올려 둔 {kind === "pdf" ? "PDF 가" : "이미지가"} 없습니다.{" "}
              <Link
                href="/admin/media/new"
                className="font-semibold text-navy underline-offset-4 hover:underline"
              >
                파일 올리기
              </Link>
            </p>
          ) : (
            <>
              <label htmlFor={searchId} className="sr-only">
                파일명으로 찾기
              </label>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="파일명으로 찾기"
                disabled={disabled}
                className="w-full rounded-md border border-line bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus:border-navy-soft"
              />

              {filtered.length === 0 ? (
                <p className="mt-3 text-xs text-muted">
                  &ldquo;{query}&rdquo; 와 맞는 파일이 없습니다.
                </p>
              ) : (
                <ul
                  className={cn(
                    "mt-3 grid max-h-72 gap-3 overflow-y-auto",
                    kind === "pdf" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-3 sm:grid-cols-4",
                  )}
                >
                  {filtered.map((option) => {
                    const isSelected = option.id === value;

                    return (
                      <li key={option.id}>
                        <button
                          type="button"
                          onClick={() => setValue(option.id)}
                          disabled={disabled}
                          aria-pressed={isSelected}
                          title={option.originalName}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md border p-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed",
                            kind === "image" && "flex-col",
                            isSelected
                              ? "border-navy bg-navy-tint"
                              : "border-line bg-background hover:border-navy",
                          )}
                        >
                          <MediaThumb
                            url={option.url}
                            kind={option.kind}
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
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
