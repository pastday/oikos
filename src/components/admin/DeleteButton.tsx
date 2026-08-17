"use client";

import { useFormStatus } from "react-dom";

/**
 * 삭제 확인 버튼.
 *
 * 되돌릴 수 없는 동작이라 제출 전에 한 번 더 묻는다.
 * 이것은 실수 방지용이며, **권한 확인은 서버 액션에서 다시 한다.**
 * (브라우저 확인창은 우회할 수 있으므로 보안 수단이 아니다)
 */
export function DeleteButton({
  confirmMessage,
  label,
}: {
  confirmMessage: string;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
      className="rounded-md border border-[#b3261e]/40 px-4 py-2 text-xs font-semibold text-[#b3261e] transition-colors hover:bg-[#b3261e]/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "삭제 중…" : label}
    </button>
  );
}
