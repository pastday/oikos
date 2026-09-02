"use client";

import { useId, useState } from "react";

/**
 * 학교소식 관련 링크(기사 / 동영상) 입력. (학교소식 UX 정비 3항)
 *
 * ## 저장 방식
 *
 * 행마다 hidden input 을 여러 개 두는 대신, **한 종류 전체를 JSON 배열**로 만들어
 * `name` 하나에 담는다. (`articleLinksJson` / `videoLinksJson`)
 * 서버 액션이 `JSON.parse` 후 zod 로 검증한다. 구조화된 여러 행을 폼으로 나르는
 * 가장 단순한 방법이며, `NewsAttachmentsField` 의 hidden input 반복과 목적이 같다.
 *
 * ## 상태
 *
 * 모든 값은 이 컴포넌트의 state 에만 있다. 부모 폼이 저장 실패로 다시 그려져도
 * 이 컴포넌트는 리마운트되지 않으므로 입력이 그대로 남는다. (지시 2항)
 */

export type NewsLinkRow = {
  titleKo: string;
  titleEn: string;
  url: string;
};

const controlClassName =
  "w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted/50 focus:border-navy-soft disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted";

export function NewsLinksField({
  name,
  field,
  heading,
  description,
  urlPlaceholder,
  addLabel,
  defaultValue,
  disabled,
}: {
  /** JSON 배열을 담을 hidden input 이름 (예: "articleLinksJson") */
  name: string;
  /** 저장 오류 시 폼이 스크롤할 대상 표식 */
  field: string;
  heading: string;
  description: string;
  urlPlaceholder: string;
  addLabel: string;
  defaultValue: NewsLinkRow[];
  disabled?: boolean;
}) {
  const baseId = useId();
  const [rows, setRows] = useState<NewsLinkRow[]>(defaultValue);

  function update(index: number, patch: Partial<NewsLinkRow>) {
    setRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  }

  function add() {
    setRows((previous) => [...previous, { titleKo: "", titleEn: "", url: "" }]);
  }

  function remove(index: number) {
    setRows((previous) => previous.filter((_, rowIndex) => rowIndex !== index));
  }

  // 제목·URL 둘 다 빈 행은 저장 대상에서 뺀다. (추가만 하고 안 채운 행)
  const payload = rows
    .map((row) => ({
      titleKo: row.titleKo.trim(),
      titleEn: row.titleEn.trim(),
      url: row.url.trim(),
    }))
    .filter((row) => row.titleKo.length > 0 || row.url.length > 0);

  return (
    <div data-field={field} className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(payload)} readOnly />

      <div>
        <h4 className="text-sm font-semibold text-navy">{heading}</h4>
        <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
      </div>

      {rows.length > 0 && (
        <ul className="flex flex-col gap-3">
          {rows.map((row, index) => (
            <li
              key={index}
              className="rounded-md border border-line bg-background p-3"
            >
              <div className="flex flex-col gap-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`${baseId}-${index}-ko`}
                      className="text-xs font-semibold text-navy"
                    >
                      링크 제목 (한국어)
                    </label>
                    <input
                      id={`${baseId}-${index}-ko`}
                      type="text"
                      value={row.titleKo}
                      maxLength={200}
                      disabled={disabled}
                      onChange={(event) =>
                        update(index, { titleKo: event.target.value })
                      }
                      className={controlClassName}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`${baseId}-${index}-en`}
                      className="text-xs font-semibold text-navy"
                    >
                      Title (English)
                    </label>
                    <input
                      id={`${baseId}-${index}-en`}
                      type="text"
                      value={row.titleEn}
                      maxLength={200}
                      disabled={disabled}
                      placeholder="비워 두면 한국어 제목 표시"
                      onChange={(event) =>
                        update(index, { titleEn: event.target.value })
                      }
                      className={controlClassName}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`${baseId}-${index}-url`}
                    className="text-xs font-semibold text-navy"
                  >
                    URL
                  </label>
                  <input
                    id={`${baseId}-${index}-url`}
                    type="url"
                    inputMode="url"
                    value={row.url}
                    maxLength={500}
                    disabled={disabled}
                    placeholder={urlPlaceholder}
                    onChange={(event) =>
                      update(index, { url: event.target.value })
                    }
                    className={controlClassName}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={disabled}
                    className="rounded border border-[#b3261e]/40 px-3 py-1 text-xs font-semibold text-[#b3261e] transition-colors hover:bg-[#b3261e]/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div>
        <button
          type="button"
          onClick={add}
          disabled={disabled}
          className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-50"
        >
          + {addLabel}
        </button>
      </div>
    </div>
  );
}
