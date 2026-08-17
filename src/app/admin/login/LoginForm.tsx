"use client";

import { useActionState } from "react";
import { login, type LoginFormState } from "./actions";

const INITIAL_STATE: LoginFormState = { status: "idle" };

const inputClassName =
  "w-full rounded-md border border-line bg-background px-3.5 py-2.5 text-[0.9375rem] text-foreground transition-colors placeholder:text-muted/70 focus:border-navy-soft disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted";

/**
 * 관리자 로그인 폼.
 *
 * 비밀번호는 state 로 들고 있지 않는다. 브라우저 메모리에 남길 이유가 없고,
 * 실패해도 비밀번호는 다시 입력하게 하는 편이 안전하다.
 * 이메일은 uncontrolled 입력이라 실패 후에도 DOM 에 그대로 남는다.
 */
export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, INITIAL_STATE);

  const failed = state.status === "invalid";

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {failed && (
        <p
          role="alert"
          className="rounded-md border border-[#b3261e]/40 bg-[#b3261e]/[0.05] px-4 py-3 text-sm font-medium text-[#b3261e]"
        >
          이메일 또는 비밀번호를 확인해 주세요.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="admin-email" className="text-sm font-semibold text-navy">
          이메일
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          maxLength={160}
          disabled={isPending}
          aria-invalid={failed}
          className={inputClassName}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="admin-password"
          className="text-sm font-semibold text-navy"
        >
          비밀번호
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          disabled={isPending}
          aria-invalid={failed}
          className={inputClassName}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 inline-flex w-full justify-center rounded-md bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:bg-muted"
      >
        {isPending ? "로그인 중…" : "로그인"}
      </button>
    </form>
  );
}
