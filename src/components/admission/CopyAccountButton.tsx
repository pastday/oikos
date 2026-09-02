"use client";

import { useState } from "react";

/**
 * 계좌번호를 clipboard 에 복사하는 작은 버튼. (입학허가비 안내 지시 13항)
 *
 * 완료 화면 전체를 client component 로 만들지 않기 위해 이 버튼만 분리한다.
 * 복사 실패(권한 거부·구형 브라우저)해도 조용히 넘어간다. 번호는 옆에 이미 보인다.
 */
export function CopyAccountButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard 접근이 막혀 있으면 아무것도 하지 않는다.
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={copy}
        className="rounded-md border border-navy/30 px-3 py-1 text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
      >
        {label}
      </button>
      <span
        aria-live="polite"
        className="text-xs font-semibold text-navy"
      >
        {copied ? copiedLabel : ""}
      </span>
    </span>
  );
}
