"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { MediaThumb } from "@/components/admin/MediaThumb";
import type { MediaChoice } from "@/lib/media/select";
import { cn } from "@/lib/cn";

/**
 * 학교소식 첨부파일 선택. (학교소식 지시 4·7·14항)
 *
 * ## 왜 `MediaPicker` 를 그대로 쓰지 않는가
 *
 * `MediaPicker` 는 값이 하나뿐이다. (교수 사진, 저서 표지 등) 첨부파일은 개수가 가변이라
 * **선택된 목록 + 순서 + 추가/제거**가 필요하다. 그 차이만큼만 여기서 새로 만든다.
 * 파일 자체는 `MediaPicker` 와 똑같이 **이미 [미디어] 에 올라간 파일 중에서** 고른다.
 * 여기서 파일을 업로드하지 않는다.
 *
 * 값은 `attachmentMediaIds` 라는 이름의 hidden input **여러 개**로 나른다.
 * 서버 액션이 `formData.getAll("attachmentMediaIds")` 로 순서대로 받는다.
 */
export function NewsAttachmentsField({
  options,
  defaultValue,
  disabled,
}: {
  /** [미디어] 에 올라간 모든 파일 (이미지 · PDF) */
  options: MediaChoice[];
  /** 이미 연결된 Media id. 표시순서대로 */
  defaultValue: string[];
  disabled?: boolean;
}) {
  const baseId = useId();
  const listId = `${baseId}-list`;
  const searchId = `${baseId}-search`;

  const [selected, setSelected] = useState<string[]>(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const byId = useMemo(
    () => new Map(options.map((option) => [option.id, option])),
    [options],
  );

  const available = useMemo(() => {
    const chosen = new Set(selected);
    const keyword = query.trim().toLowerCase();
    return options.filter(
      (option) =>
        !chosen.has(option.id) &&
        (keyword.length === 0 ||
          option.originalName.toLowerCase().includes(keyword)),
    );
  }, [options, selected, query]);

  function add(id: string) {
    setSelected((previous) =>
      previous.includes(id) ? previous : [...previous, id],
    );
  }

  function remove(id: string) {
    setSelected((previous) => previous.filter((item) => item !== id));
  }

  function move(index: number, direction: -1 | 1) {
    setSelected((previous) => {
      const next = [...previous];
      const target = index + direction;
      if (target < 0 || target >= next.length) return previous;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      {selected.map((id) => (
        <input
          key={id}
          type="hidden"
          name="attachmentMediaIds"
          value={id}
          readOnly
        />
      ))}

      <span className="text-sm font-semibold text-navy">첨부파일</span>
      <p className="text-xs leading-relaxed text-muted">
        [미디어] 에 올려 둔 파일 중에서 고릅니다. 여러 개를 순서대로 붙일 수
        있으며, 비워 두면 첨부파일 영역이 표시되지 않습니다.
      </p>

      {selected.length > 0 && (
        <ul className="mt-1 flex flex-col gap-2">
          {selected.map((id, index) => {
            const option = byId.get(id);

            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-md border border-line bg-background p-2"
              >
                {option ? (
                  <MediaThumb
                    url={option.url}
                    kind={option.kind}
                    alt=""
                    size="sm"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-dashed border-line bg-surface text-[0.625rem] text-muted">
                    없음
                  </span>
                )}

                <span className="min-w-0 flex-1 truncate text-sm text-foreground/85">
                  {option ? option.originalName : "삭제된 파일"}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={disabled || index === 0}
                    aria-label="위로"
                    className="rounded border border-line px-2 py-1 text-xs text-muted transition-colors hover:border-navy hover:text-navy disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={disabled || index === selected.length - 1}
                    aria-label="아래로"
                    className="rounded border border-line px-2 py-1 text-xs text-muted transition-colors hover:border-navy hover:text-navy disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(id)}
                    disabled={disabled}
                    className="rounded border border-[#b3261e]/40 px-2 py-1 text-xs font-semibold text-[#b3261e] transition-colors hover:bg-[#b3261e]/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    제거
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-1">
        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          disabled={disabled}
          aria-expanded={open}
          aria-controls={listId}
          className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-50"
        >
          {open ? "목록 닫기" : "파일 추가"}
        </button>
      </div>

      {open && (
        <div
          id={listId}
          className="mt-2 rounded-lg border border-line bg-surface p-4"
        >
          {options.length === 0 ? (
            <p className="text-xs text-muted">
              올려 둔 파일이 없습니다.{" "}
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

              {available.length === 0 ? (
                <p className="mt-3 text-xs text-muted">
                  추가할 수 있는 파일이 없습니다.
                </p>
              ) : (
                <ul className="mt-3 grid max-h-72 gap-2 overflow-y-auto">
                  {available.map((option) => (
                    <li key={option.id}>
                      <button
                        type="button"
                        onClick={() => add(option.id)}
                        disabled={disabled}
                        title={option.originalName}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md border border-line bg-background p-2 text-left transition-colors hover:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed",
                        )}
                      >
                        <MediaThumb
                          url={option.url}
                          kind={option.kind}
                          alt=""
                          size="sm"
                        />
                        <span className="min-w-0 flex-1 truncate text-xs text-foreground/85">
                          {option.originalName}
                        </span>
                        <span className="shrink-0 text-[0.625rem] font-semibold tracking-wide text-muted uppercase">
                          {option.kind === "pdf" ? "PDF" : "IMG"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
