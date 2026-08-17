import type { DefaultSession } from "next-auth";
import type { AdminRole } from "@/generated/prisma/enums";

/**
 * Auth.js 타입 확장.
 *
 * 기본 User/Session/JWT 에는 `role` 이 없다. any 로 우회하지 않고 module augmentation 으로
 * 정식 확장해서 `session.user.role` 을 타입 안전하게 쓴다. (CLAUDE.md 21항 - any 최소화)
 *
 * role 타입은 Prisma 가 생성한 `AdminRole` 을 그대로 쓴다.
 * schema.prisma 에서 권한이 늘면 여기서 따로 고칠 것이 없고, 화면 쪽에서 컴파일 오류로 드러난다.
 */

declare module "next-auth" {
  /**
   * authorize() 가 돌려주는 값. passwordHash 는 포함하지 않는다.
   *
   * 기본 타입의 `id` 는 optional 이지만 이 프로젝트의 authorize 는 항상 id 를 채운다.
   * 여기서 필수로 좁혀 두면 jwt 콜백에서 undefined 검사를 하지 않아도 된다.
   */
  interface User {
    id: string;
    role: AdminRole;
  }

  interface Session {
    user: {
      id: string;
      role: AdminRole;
    } & DefaultSession["user"];
  }
}

/**
 * JWT 는 `next-auth/jwt` 가 아니라 `@auth/core/jwt` 에 선언되어 있다.
 * `next-auth/jwt` 는 `export * from "@auth/core/jwt"` 로 다시 내보내기만 하므로
 * 거기에 augmentation 을 걸면 interface 병합이 일어나지 않는다. (실제로 확인함)
 */
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: AdminRole;
  }
}
