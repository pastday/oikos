"use client";

/**
 * 브라우저 인쇄 대화상자를 연다.
 *
 * 서버에서 PDF 를 만들지 않고 관리자가 "대상: PDF 로 저장" 을 고르는 방식이다. (지시 23항)
 * 버튼 하나 때문에 페이지 전체를 client 로 만들지 않도록 이 조각만 분리한다.
 */
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md border border-navy bg-navy px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-soft"
    >
      {label}
    </button>
  );
}
