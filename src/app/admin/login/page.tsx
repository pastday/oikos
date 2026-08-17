import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ADMIN_HOME_PATH } from "@/lib/auth-guard";
import { defaultLocale } from "@/i18n/config";
import { LoginForm } from "./LoginForm";

/**
 * 관리자 로그인 페이지.
 *
 * `(protected)` route group 밖에 두어야 한다. 보호 layout 안에 넣으면
 * 비로그인 사용자가 로그인 페이지로 갔다가 다시 로그인 페이지로 보내지는 무한 redirect 가 된다.
 *
 * 회원가입·비밀번호 찾기는 만들지 않는다. 관리자 계정은 스크립트로만 만든다.
 */

export const metadata: Metadata = {
  title: "관리자 로그인 | Oikos 관리자",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // 이미 로그인했다면 로그인 화면을 다시 보여주지 않는다.
  const session = await auth();
  if (session?.user) {
    redirect(ADMIN_HOME_PATH);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="font-serif text-lg font-bold tracking-[0.14em] text-navy">
            OIKOS ADMIN
          </p>
          <h1 className="mt-2 text-sm text-muted">
            오이코스대학교 경영대학원 홈페이지 관리자
          </h1>
        </div>

        <div className="mt-7 rounded-lg border border-line bg-background px-6 py-7 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm">
          <Link
            href={`/${defaultLocale}`}
            className="text-muted underline-offset-4 transition-colors hover:text-navy hover:underline"
          >
            사용자 홈페이지로 이동
          </Link>
        </p>
      </div>
    </main>
  );
}
