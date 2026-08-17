import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { defaultLocale } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth-guard";
import { logout } from "./actions";

/**
 * 인증이 필요한 관리자 화면의 공통 layout.
 *
 * `(protected)` route group 이므로 URL 에는 나타나지 않는다. (`/admin` 그대로)
 * 이 아래의 모든 화면은 렌더링 전에 `requireAdmin()` 을 통과한다.
 * 화면마다 인증 확인을 반복하지 않기 위해 여기 한 곳에서 처리한다.
 *
 * 세션 쿠키를 읽으므로 이 layout 아래는 정적 생성되지 않고 요청마다 렌더링된다.
 */

/** 관리자 화면은 사용자별 데이터를 다룬다. 캐시되지 않도록 명시한다. */
export const dynamic = "force-dynamic";

const roleLabels = {
  SUPER_ADMIN: "최고관리자",
  ADMIN: "관리자",
} as const;

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 인증 실패 시 여기서 /admin/login 으로 redirect 되고 아래는 실행되지 않는다.
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex shrink-0 flex-col gap-7 bg-navy px-4 py-6 lg:w-60">
        <Link
          href="/admin"
          className="px-3 font-serif text-base font-bold tracking-[0.12em] text-white"
        >
          OIKOS ADMIN
        </Link>

        <AdminNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-background px-5 py-3.5 lg:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-navy">
              {admin.name}
              <span className="ml-2 rounded bg-navy-tint px-1.5 py-0.5 text-[0.6875rem] font-medium text-navy">
                {roleLabels[admin.role]}
              </span>
            </p>
            <p className="truncate text-xs text-muted">{admin.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${defaultLocale}`}
              className="rounded-md border border-line px-3.5 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
            >
              홈페이지 보기
            </Link>

            {/* 로그아웃은 상태를 바꾸는 동작이므로 링크가 아니라 form 으로 둔다. */}
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-line px-3.5 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
              >
                로그아웃
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-5 py-7 lg:px-8 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
