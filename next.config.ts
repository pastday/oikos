import type { NextConfig } from "next";
import { defaultLocale } from "./src/i18n/config";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 사이트 루트 접속은 항상 기본 언어로 보낸다.
      // 브라우저 언어를 감지해 영어로 강제 이동시키지 않는다.
      // middleware 를 따로 두지 않고 이 설정만으로 처리한다.
      {
        source: "/",
        destination: `/${defaultLocale}`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
