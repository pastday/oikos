"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { ADMIN_HOME_PATH } from "@/lib/auth-guard";

/**
 * 관리자 로그인 서버 액션.
 *
 * 실패 사유(없는 계정 / 틀린 비밀번호 / 비활성 계정)를 구분해서 돌려주지 않는다.
 * 어떤 이메일이 등록되어 있는지 알려주지 않기 위해서다. (CLAUDE.md 18항)
 */

export type LoginFormState = { status: "idle" } | { status: "invalid" };

export async function login(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { status: "invalid" };
  }

  try {
    // 성공하면 signIn 이 redirect 예외를 던지므로 이 아래로 내려오지 않는다.
    await signIn("credentials", {
      email,
      password,
      redirectTo: ADMIN_HOME_PATH,
    });
  } catch (error) {
    // 인증 실패는 여기서 흡수한다.
    if (error instanceof AuthError) {
      return { status: "invalid" };
    }
    // redirect 예외는 Next.js 가 처리해야 하므로 반드시 다시 던진다.
    throw error;
  }

  return { status: "idle" };
}
