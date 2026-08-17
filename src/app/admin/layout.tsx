import type { Metadata } from "next";
import "../globals.css";

/**
 * 관리자 영역의 root layout.
 *
 * 사용자 사이트의 root layout 은 `src/app/[locale]/layout.tsx` 이고 locale 별로 `<html lang>` 을 바꾼다.
 * 관리자 화면은 locale 라우팅을 쓰지 않으므로(한국어 고정) 별도의 root layout 을 둔다.
 * 두 영역이 Header/Footer 를 공유하지 않는 것도 의도된 것이다.
 *
 * **이 layout 에서는 인증을 확인하지 않는다.** /admin/login 이 이 아래에 있기 때문이다.
 * 인증 확인은 `(protected)` route group 의 layout 에서 한다. (redirect loop 방지)
 */

export const metadata: Metadata = {
  title: "Oikos 관리자",
  // 관리자 화면이 검색엔진에 노출될 이유가 없다.
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-admin-bg text-foreground">{children}</body>
    </html>
  );
}
