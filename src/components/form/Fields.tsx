"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { spamGuardFields } from "@/lib/validation/inquiry";

/**
 * 입학상담 · 설명회 신청 폼이 함께 쓰는 입력 컴포넌트.
 *
 * 범용 폼 프레임워크를 만들지 않는다. (CLAUDE.md 21항)
 * 두 폼에서 실제로 반복되는 것 — 라벨 연결, 오류 표시, aria 속성, 여백 — 만 여기서 처리하고
 * 필드 구성 자체는 각 폼이 직접 나열한다.
 */

type FieldFrameProps = {
  label: string;
  /** 필수 여부. 라벨 옆 표시와 required 속성에 함께 쓰인다. */
  required?: boolean;
  requiredMark: string;
  optionalMark: string;
  hint?: string;
  /** 표시할 오류 문구. 없으면 정상 상태. */
  error?: string;
};

type ControlIds = {
  id: string;
  describedBy?: string;
  invalid: boolean;
};

/** 라벨 · 힌트 · 오류를 감싸고 입력 요소에 넘길 id 들을 만들어 준다. */
function FieldFrame({
  label,
  required,
  requiredMark,
  optionalMark,
  hint,
  error,
  children,
}: FieldFrameProps & { children: (ids: ControlIds) => ReactNode }) {
  const baseId = useId();
  const id = `${baseId}-input`;
  const hintId = hint ? `${baseId}-hint` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;

  const describedBy =
    [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
        <span
          className={cn(
            "ml-1.5 text-xs font-medium",
            required ? "text-gold" : "text-muted",
          )}
        >
          {required ? requiredMark : optionalMark}
        </span>
      </label>

      {children({ id, describedBy, invalid: Boolean(error) })}

      {/* 힌트를 입력칸 아래에 둔다. 위에 두면 2열 배치에서 힌트가 있는 칸만 아래로 밀려 줄이 어긋난다. */}
      {hint && (
        <p id={hintId} className="text-xs leading-relaxed text-muted">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-xs font-medium text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}

/** 입력 요소 공통 스타일. 오류일 때 테두리 색으로도 상태를 알린다. */
function controlClassName(invalid: boolean): string {
  return cn(
    "w-full rounded-md border bg-background px-3.5 py-2.5 text-[0.9375rem] text-foreground",
    "transition-colors placeholder:text-muted/70",
    "disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted",
    invalid
      ? "border-[#b3261e] focus:border-[#b3261e]"
      : "border-line focus:border-navy-soft",
  );
}

// ---------------------------------------------------------------------------

type TextFieldProps = FieldFrameProps & {
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "number";
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  maxLength?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export function TextField({
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
  min,
  max,
  disabled,
  ...frame
}: TextFieldProps) {
  return (
    <FieldFrame {...frame}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          min={min}
          max={max}
          disabled={disabled}
          required={frame.required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={controlClassName(invalid)}
        />
      )}
    </FieldFrame>
  );
}

// ---------------------------------------------------------------------------

type TextAreaFieldProps = FieldFrameProps & {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
};

export function TextAreaField({
  name,
  value,
  onChange,
  placeholder,
  rows = 6,
  maxLength,
  disabled,
  ...frame
}: TextAreaFieldProps) {
  return (
    <FieldFrame {...frame}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          required={frame.required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={cn(controlClassName(invalid), "resize-y leading-relaxed")}
        />
      )}
    </FieldFrame>
  );
}

// ---------------------------------------------------------------------------

export type SelectOption = { value: string; label: string };

type SelectFieldProps = FieldFrameProps & {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  /** 아직 선택하지 않았을 때 보여줄 문구. 값은 빈 문자열이다. */
  placeholder: string;
  disabled?: boolean;
};

export function SelectField({
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  ...frame
}: SelectFieldProps) {
  return (
    <FieldFrame {...frame}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required={frame.required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={cn(controlClassName(invalid), "appearance-none pr-9")}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldFrame>
  );
}

// ---------------------------------------------------------------------------

type CheckboxFieldProps = {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** 라벨 아래 보조 설명. 수집 항목·이용 목적처럼 사실만 적는다. */
  description?: ReactNode;
  error?: string;
  disabled?: boolean;
};

export function CheckboxField({
  name,
  checked,
  onChange,
  label,
  description,
  error,
  disabled,
}: CheckboxFieldProps) {
  const baseId = useId();
  const id = `${baseId}-checkbox`;
  const descriptionId = description ? `${baseId}-description` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div
      className={cn(
        "rounded-md border px-4 py-4",
        error ? "border-[#b3261e] bg-[#b3261e]/[0.03]" : "border-line bg-surface",
      )}
    >
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="mt-0.5 h-4 w-4 shrink-0 accent-navy"
        />
        <label
          htmlFor={id}
          className="text-sm leading-relaxed font-medium text-foreground/85"
        >
          {label}
        </label>
      </div>

      {description && (
        <div
          id={descriptionId}
          className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted"
        >
          {description}
        </div>
      )}

      {error && (
        <p id={errorId} className="mt-2.5 text-xs font-medium text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

/**
 * 스팸 방어용 숨김 필드 묶음. 두 신청 폼이 그대로 함께 쓴다.
 *
 * - honeypot: `display:none` 대신 화면 밖으로 밀어내고 스크린리더·탭 이동에서 제외한다.
 *   사람이 값을 채울 경로가 없으므로 값이 있으면 자동 제출로 본다.
 * - loadedAt: 정적 생성된 HTML 에 빌드 시각이 박히면 안 되므로 브라우저에서만 채운다.
 *   state 대신 DOM 을 직접 갱신해 불필요한 재렌더를 만들지 않는다.
 *
 * 판정은 서버에서만 한다. 여기서는 값을 실어 보내기만 한다.
 */
export function SpamGuardFields() {
  const loadedAtRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loadedAtRef.current) {
      loadedAtRef.current.value = String(Date.now());
    }
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor={spamGuardFields.honeypot}>Company</label>
        <input
          id={spamGuardFields.honeypot}
          name={spamGuardFields.honeypot}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <input ref={loadedAtRef} type="hidden" name={spamGuardFields.loadedAt} />
    </>
  );
}
