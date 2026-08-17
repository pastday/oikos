"use server";

import { signOut } from "@/auth";
import { ADMIN_LOGIN_PATH } from "@/lib/auth-guard";

/** 로그아웃. Auth.js 가 세션 쿠키를 정리하고 로그인 페이지로 보낸다. */
export async function logout(): Promise<void> {
  await signOut({ redirectTo: ADMIN_LOGIN_PATH });
}
