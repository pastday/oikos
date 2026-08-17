import Link from "next/link";
import type { ReactNode } from "react";
import type { InquiryStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/cn";
import { formatDateTime, toIsoString } from "@/lib/admin/format";
import type { PaginationInfo } from "@/lib/admin/inquiry";

/**
 * 관리자 화면 공통 UI 조각.
 *
 * 상담 관리와 설명회 관리가 실제로 똑같이 반복하는 것만 모았다.
 * 화려한 디자인 시스템을 만들지 않는다. 관리자 화면은 정보를 빨리 확인하는 도구다.
 */

// ---------------------------------------------------------------------------

export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  /** 우측에 놓을 보조 요소 (예: 돌아가기 링크) */
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-serif text-2xl font-bold text-navy">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted">{description}</p>
        )}
      </div>
      {children}
    </header>
  );
}

// ---------------------------------------------------------------------------

/**
 * 상태 배지.
 *
 * 색만으로 의미를 전달하지 않는다. 문구가 항상 함께 있고,
 * 색을 구분하지 못해도 글자로 상태를 알 수 있다.
 */
export function StatusBadge({
  status,
  label,
}: {
  status: InquiryStatus;
  label: string;
}) {
  const tone = {
    NEW: "border-navy/25 bg-navy-tint text-navy",
    IN_PROGRESS: "border-gold/40 bg-beige text-[#7a5c2b]",
    COMPLETED: "border-line bg-surface text-muted",
  }[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        tone,
      )}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------

/** 목록 위쪽 필터 줄. 링크 기반이라 JS 없이도 동작하고 뒤로가기가 자연스럽다. */
export function FilterGroup({
  label,
  options,
}: {
  label: string;
  options: { href: string; label: string; active: boolean }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-muted">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <Link
            key={option.label}
            href={option.href}
            aria-current={option.active ? "true" : undefined}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              option.active
                ? "border-navy bg-navy text-white"
                : "border-line bg-background text-muted hover:border-navy hover:text-navy",
            )}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center">
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function Pagination({
  pagination,
  hrefFor,
}: {
  pagination: PaginationInfo;
  /** 페이지 번호 → 링크 */
  hrefFor: (page: number) => string;
}) {
  const { page, totalPages, totalCount, firstIndex, lastIndex } = pagination;

  return (
    <nav
      aria-label="페이지 이동"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"
    >
      <p className="text-xs text-muted">
        {totalCount === 0
          ? "0건"
          : `전체 ${totalCount}건 중 ${firstIndex}–${lastIndex}건`}
      </p>

      {totalPages > 1 && (
        <ul className="flex items-center gap-1.5">
          <li>
            <PageLink
              href={hrefFor(page - 1)}
              disabled={!pagination.hasPrevious}
              label="이전 페이지"
            >
              이전
            </PageLink>
          </li>
          <li aria-current="page" className="px-2 text-xs font-semibold text-navy">
            {page} / {totalPages}
          </li>
          <li>
            <PageLink
              href={hrefFor(page + 1)}
              disabled={!pagination.hasNext}
              label="다음 페이지"
            >
              다음
            </PageLink>
          </li>
        </ul>
      )}
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  const className =
    "inline-flex rounded-md border px-3 py-1.5 text-xs font-medium transition-colors";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(className, "border-line bg-surface text-muted/50")}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        className,
        "border-line bg-background text-navy hover:border-navy",
      )}
    >
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------------

/** 상세 화면의 라벨 + 값 한 줄. */
export function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-xs font-semibold text-muted sm:pt-0.5">{label}</dt>
      <dd className="text-sm break-words text-foreground/85">{children}</dd>
    </div>
  );
}

/** 값이 없을 때 빈칸 대신 표시한다. */
export function EmptyValue({ text = "—" }: { text?: string }) {
  return <span className="text-muted">{text}</span>;
}

/** 날짜/시간 표시. 기계용 값은 UTC 원본을 datetime 속성에 남긴다. */
export function DateTimeText({ value }: { value: Date }) {
  return <time dateTime={toIsoString(value)}>{formatDateTime(value)}</time>;
}

// ---------------------------------------------------------------------------

/** 저장 결과 안내. Prisma 오류 원문은 절대 여기로 오지 않는다. */
export function AdminFormMessage({
  tone,
  message,
}: {
  tone: "success" | "error";
  message: string;
}) {
  return (
    <p
      role="status"
      className={cn(
        "rounded-md border px-4 py-2.5 text-sm font-medium",
        tone === "success"
          ? "border-navy/25 bg-navy-tint text-navy"
          : "border-[#b3261e]/40 bg-[#b3261e]/[0.05] text-[#b3261e]",
      )}
    >
      {message}
    </p>
  );
}
