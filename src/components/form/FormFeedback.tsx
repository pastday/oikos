"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/navigation";

/** 제출 버튼. 처리 중에는 비활성화되어 같은 신청이 두 번 들어가지 않게 한다. */
export function SubmitButton({
  label,
  pendingLabel,
  pending,
}: {
  label: string;
  pendingLabel: string;
  pending: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full justify-center rounded-md bg-navy px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:bg-muted sm:w-auto"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/**
 * 폼 전체에 해당하는 안내.
 * 서버 오류와 입력 오류 모두 여기에 표시하고, 상세 원인은 각 필드 아래에 둔다.
 * DB 오류 원문·stack trace 는 절대 여기로 오지 않는다. (CLAUDE.md 13항)
 */
export function FormAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-md border border-[#b3261e]/40 bg-[#b3261e]/[0.05] px-4 py-3.5 text-sm font-medium text-[#b3261e]"
    >
      {message}
    </div>
  );
}

/**
 * 제출 성공 화면. 폼을 이 화면으로 교체한다.
 * 폼이 사라지므로 새로고침이나 재클릭으로 같은 신청이 다시 들어가지 않는다.
 */
export function SuccessPanel({
  locale,
  title,
  description,
  links,
  basePath = "",
}: {
  locale: Locale;
  title: string;
  description: string;
  links: { path: string; label: string }[];
  /**
   * locale 다음에 끼워 넣을 경로. 기본값은 빈 문자열이라 A안은 지금까지와 같다.
   *
   * 디자인 B안(13단계)이 이 폼을 **그대로 재사용**하면서 `/design-b` 를 넘긴다.
   * 폼을 복제하지 않고 안내 링크만 각자의 사이트 안에 머물게 하기 위한 것이다.
   */
  basePath?: string;
}) {
  return (
    <div
      role="status"
      className="rounded-lg border border-navy/15 bg-navy-tint px-6 py-10 text-center sm:px-10"
    >
      <span
        aria-hidden="true"
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>

      <h3 className="mt-5 font-serif text-xl font-bold text-navy">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-foreground/75">
        {description}
      </p>

      <ul className="mt-7 flex flex-wrap justify-center gap-3">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              href={localePath(locale, `${basePath}${link.path}`)}
              className="inline-flex rounded-md border border-navy/30 px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 확정되지 않은 정보를 안내하는 박스. 없는 사실을 만들지 않기 위해 쓴다. */
export function PendingNotice({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-dashed border-line bg-surface px-5 py-4">
      <p className="text-sm font-semibold text-navy">{title}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}
