import { handlers } from "@/auth";

/**
 * Auth.js 가 사용하는 엔드포인트. (/api/auth/*)
 *
 * 세션 조회·CSRF 토큰·로그인/로그아웃 처리를 Auth.js 가 담당한다.
 * 쿠키나 세션을 직접 구현하지 않는다. (CLAUDE.md 18항)
 *
 * bcrypt 비교와 Prisma 조회가 필요하므로 Edge 가 아닌 Node.js 런타임에서 동작해야 한다.
 * (Next.js 기본값이 Node.js 런타임이므로 별도 설정을 두지 않는다.)
 */
export const { GET, POST } = handlers;
