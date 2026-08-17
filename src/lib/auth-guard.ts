import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { AdminRole } from "@/generated/prisma/enums";

/**
 * 관리자 화면에서 쓰는 서버 측 권한 확인 helper.
 *
 * 원칙: **메뉴를 숨기는 것으로 권한을 지키지 않는다.** (CLAUDE.md 18항)
 * 화면을 그리기 전에 서버에서 세션을 확인하고, 자격이 없으면 렌더링 자체를 하지 않는다.
 *
 * 인증 프레임워크를 새로 만들지 않는다. Auth.js 세션 위에 얇게 얹은 함수 두 개뿐이다.
 */

export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/admin";

/** 화면에 넘겨도 되는 관리자 정보. passwordHash 같은 값은 애초에 세션에 없다. */
export type AdminSessionUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};

/**
 * 로그인한 관리자를 반환한다. 로그인하지 않았으면 로그인 페이지로 보낸다.
 *
 * `redirect()` 는 반환하지 않고 예외를 던지므로, 이 함수가 값을 돌려줬다면
 * 호출한 쪽에서는 항상 인증된 상태다.
 */
export async function requireAdmin(): Promise<AdminSessionUser> {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || !user.email || !user.role) {
    redirect(ADMIN_LOGIN_PATH);
  }

  return {
    id: user.id,
    email: user.email,
    // name 은 Auth.js 기본 타입상 nullable 이다. 비어 있으면 이메일로 대체한다.
    name: user.name ?? user.email,
    role: user.role,
  };
}

/**
 * SUPER_ADMIN 전용 화면에서 쓴다.
 *
 * 권한이 모자라면 로그인 페이지가 아니라 관리자 홈으로 보낸다.
 * 이미 로그인한 사람이므로 다시 로그인시키는 것은 맞지 않다.
 *
 * 8단계 이후 관리자 계정 관리 화면에서 사용할 예정이며, 현재는 호출하는 곳이 없다.
 */
export async function requireSuperAdmin(): Promise<AdminSessionUser> {
  const user = await requireAdmin();

  if (user.role !== "SUPER_ADMIN") {
    redirect(ADMIN_HOME_PATH);
  }

  return user;
}
