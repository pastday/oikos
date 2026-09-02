"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * 관리자 CMS 입력 요소.
 *
 * 한국어와 영어를 **눈에 띄게 구분**하는 것이 이 화면의 핵심이다.
 * 관리자가 지금 어느 언어를 고치는지 헷갈리면 콘텐츠가 섞인다.
 * `LangSection` 이 그 구분을 맡고, 나머지는 평범한 입력 컴포넌트다.
 */

const controlClassName =
  "w-full rounded-md border border-line bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted/60 focus:border-navy-soft disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted";

// ---------------------------------------------------------------------------

/** 한국어 / English 입력 묶음. 색과 라벨로 구분한다. */
export function LangSection({
  lang,
  children,
}: {
  lang: "ko" | "en";
  children: ReactNode;
}) {
  const isKo = lang === "ko";

  return (
    <section
      className={cn(
        "rounded-lg border px-5 py-5",
        isKo ? "border-navy/25 bg-navy-tint/40" : "border-gold/30 bg-beige/50",
      )}
    >
      <h3
        className={cn(
          "mb-4 inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wide",
          isKo ? "bg-navy text-white" : "bg-gold text-white",
        )}
      >
        {isKo ? "한국어" : "English"}
      </h3>

      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

/** 언어와 무관한 설정 묶음 (구분·순서·공개여부 등) */
export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-background px-5 py-5">
      <h3 className="mb-4 text-sm font-semibold text-navy">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------

type FieldProps = {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  disabled?: boolean;
};

function useFieldIds(hint: string | undefined) {
  const base = useId();
  return {
    id: `${base}-field`,
    hintId: hint ? `${base}-hint` : undefined,
  };
}

function Label({
  htmlFor,
  label,
  required,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-navy">
      {label}
      {required && <span className="ml-1 text-xs text-gold">필수</span>}
    </label>
  );
}

function Hint({ id, text }: { id?: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} className="text-xs leading-relaxed text-muted">
      {text}
    </p>
  );
}

// ---------------------------------------------------------------------------

export function TextField({
  name,
  label,
  hint,
  required,
  defaultValue,
  disabled,
  maxLength = 200,
}: FieldProps & { maxLength?: number }) {
  const { id, hintId } = useFieldIds(hint);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} label={label} required={required} />
      <input
        id={id}
        name={name}
        type="text"
        defaultValue={defaultValue ?? ""}
        required={required}
        maxLength={maxLength}
        disabled={disabled}
        aria-describedby={hintId}
        className={controlClassName}
      />
      <Hint id={hintId} text={hint} />
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  hint,
  defaultValue,
  disabled,
  rows = 4,
  maxLength = 5000,
}: FieldProps & { rows?: number; maxLength?: number }) {
  const { id, hintId } = useFieldIds(hint);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} label={label} />
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        maxLength={maxLength}
        disabled={disabled}
        aria-describedby={hintId}
        className={cn(controlClassName, "resize-y leading-relaxed")}
      />
      <Hint id={hintId} text={hint} />
    </div>
  );
}

/**
 * 숫자 입력.
 *
 * 비워 두면 "미입력(null)" 으로 저장된다.
 * 원본 자료에 값이 없는 항목을 0 으로 채우지 않기 위해 비우는 것을 허용한다.
 */
export function NumberField({
  name,
  label,
  hint,
  defaultValue,
  disabled,
  min = 0,
  max = 200,
}: FieldProps & { min?: number; max?: number }) {
  const { id, hintId } = useFieldIds(hint);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} label={label} />
      <input
        id={id}
        name={name}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        aria-describedby={hintId}
        className={cn(controlClassName, "max-w-[12rem]")}
      />
      <Hint id={hintId} text={hint} />
    </div>
  );
}

/**
 * 날짜 입력. (15단계 — 저서 발행일 · 기사 게시일)
 *
 * `YYYY-MM-DD` 만 오간다. 비워 두면 "미입력(null)" 이며, 발행연도만 아는 자료를
 * 억지로 날짜로 만들지 않기 위해 비우는 것을 허용한다.
 * 값은 날짜만 다루므로 시간대 문제가 없다. (`FacultyBook.publishedAt` 주석 참고)
 */
export function DateField({
  name,
  label,
  hint,
  required,
  defaultValue,
  disabled,
}: FieldProps) {
  const { id, hintId } = useFieldIds(hint);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} label={label} required={required} />
      <input
        id={id}
        name={name}
        type="date"
        required={required}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        aria-describedby={hintId}
        className={cn(controlClassName, "max-w-[14rem]")}
      />
      <Hint id={hintId} text={hint} />
    </div>
  );
}

/**
 * 외부 링크 입력. (15단계)
 *
 * `type="url"` 이라 브라우저가 형식을 한 번 걸러 준다. **그건 편의일 뿐이다.**
 * `http` / `https` 만 허용하는 실제 검증은 서버(`validation.ts` 의 `externalUrl`)가 한다.
 * 여기서 `pattern` 으로 스킴까지 막지 않는 이유는, 브라우저 검증은 우회할 수 있어
 * 두 곳에 규칙을 적어 두면 어긋나기만 하기 때문이다.
 */
export function UrlField({
  name,
  label,
  hint,
  defaultValue,
  disabled,
}: FieldProps) {
  const { id, hintId } = useFieldIds(hint);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} label={label} />
      <input
        id={id}
        name={name}
        type="url"
        inputMode="url"
        placeholder="https://"
        defaultValue={defaultValue ?? ""}
        maxLength={500}
        disabled={disabled}
        aria-describedby={hintId}
        className={controlClassName}
      />
      <Hint id={hintId} text={hint} />
    </div>
  );
}

export function SelectField({
  name,
  label,
  hint,
  required,
  defaultValue,
  disabled,
  options,
}: FieldProps & { options: { value: string; label: string }[] }) {
  const { id, hintId } = useFieldIds(hint);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} label={label} required={required} />
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        aria-describedby={hintId}
        className={controlClassName}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Hint id={hintId} text={hint} />
    </div>
  );
}

export function CheckboxField({
  name,
  label,
  hint,
  defaultChecked,
  disabled,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  const { id, hintId } = useFieldIds(hint);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <input
          id={id}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          disabled={disabled}
          aria-describedby={hintId}
          className="h-4 w-4 accent-navy"
        />
        <label htmlFor={id} className="text-sm font-semibold text-navy">
          {label}
        </label>
      </div>
      <Hint id={hintId} text={hint} />
    </div>
  );
}
