import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * 관리자 인증 설정. (Auth.js v5 / next-auth 5.0.0-beta)
 *
 * 설계 배경은 docs/decisions.md 7단계 항목 참고. 요점만 적으면:
 *
 *  - **Credentials Provider 만 쓴다.** OAuth 는 구현하지 않는다.
 *  - **session 전략은 JWT 다.** Credentials Provider 는 DB session 을 지원하지 않는다.
 *    따라서 Auth.js 용 Account / Session / VerificationToken 테이블도, Prisma Adapter 도 필요 없다.
 *    `AdminUser` 는 OAuth 계정 저장소가 아니라 이 프로젝트의 도메인 모델이다.
 *  - **passwordHash 는 이 파일 밖으로 절대 나가지 않는다.** authorize 가 돌려주는 값에도,
 *    JWT 에도, session 에도 넣지 않는다.
 *  - 로그인 실패 사유를 구분해서 알려주지 않는다. 계정 존재 여부가 드러나면 안 된다.
 */

/** 서버에서 다시 검증한다. 클라이언트 검증만 믿지 않는다. */
const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().max(160).pipe(z.email()),
  password: z.string().min(1).max(200),
});

/**
 * 존재하지 않는 계정일 때도 bcrypt 비교를 한 번 수행하기 위한 더미 해시.
 *
 * 이것이 없으면 "계정 없음" 은 즉시 응답하고 "비밀번호 틀림" 은 해시 비교 시간만큼 늦어져,
 * 응답 시간 차이로 가입된 이메일을 알아낼 수 있다.
 * 실제 비밀번호가 아니며, 어떤 입력과도 일치하지 않는다.
 */
const DUMMY_PASSWORD_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEeO3Vv1kUqCTQBk6Yk7wq9hxYVRVLxvQ2C";

/** 관리자 세션 유효기간. 사용자 사이트가 아니라 관리 도구이므로 짧게 잡는다. */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export const { handlers, auth, signIn, signOut } = NextAuth({
  /**
   * Auth.js v5 는 콜백 URL 을 만들 때 요청의 Host 를 신뢰해도 되는지 확인한다.
   * Vercel 이 아닌 곳에서는 이 값을 켜지 않으면 UntrustedHost 로 로그인이 실패한다.
   *
   * 이 프로젝트는 nginx 리버스 프록시 뒤에서 동작하고,
   * nginx 가 `server_name oikos.pastday.co.kr` 로 호스트를 한정한 뒤 `Host` 를 그대로 넘긴다.
   * (deploy/nginx/oikos.pastday.co.kr.conf)
   * 따라서 앱에 임의의 Host 가 도달하지 않으므로 신뢰해도 된다.
   *
   * AUTH_URL 을 환경마다 고정하는 방법도 있지만, 개발 중 포트가 바뀌면 로그인 후
   * 엉뚱한 주소로 이동해 버린다. 실제로 그 문제를 겪어 이 방식을 택했다.
   */
  trustHost: true,

  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },

  // 기본 Auth.js 로그인 화면 대신 우리가 만든 관리자 로그인 페이지를 쓴다.
  pages: {
    signIn: "/admin/login",
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },

      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const admin = await prisma.adminUser.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            passwordHash: true,
          },
        });

        // 계정이 없거나 비활성이면 실패. 두 경우를 구분해서 알려주지 않는다.
        if (!admin || !admin.isActive) {
          await compare(password, DUMMY_PASSWORD_HASH);
          return null;
        }

        const passwordMatches = await compare(password, admin.passwordHash);
        if (!passwordMatches) return null;

        // 로그인 기록 갱신. 실패해도 로그인 자체를 막지 않는다.
        try {
          await prisma.adminUser.update({
            where: { id: admin.id },
            data: { lastLoginAt: new Date() },
          });
        } catch (error) {
          console.error("[auth] lastLoginAt 갱신 실패", error);
        }

        // passwordHash 는 의도적으로 제외한다.
        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
  ],

  callbacks: {
    /** 로그인 직후에만 user 가 채워진다. 이때 권한을 토큰에 심는다. */
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    /** 토큰에 있는 값만 세션으로 내보낸다. DB 를 다시 조회하지 않는다. */
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
});
