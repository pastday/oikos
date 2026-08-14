import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 임시 메타데이터. 실제 SEO 설정(title/description/OG/canonical/locale)은
// 3단계 공통 레이아웃·다국어 작업에서 locale 기반으로 다시 구성한다.
export const metadata: Metadata = {
  title: "Oikos University",
  description: "Oikos University Graduate School of Business",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
