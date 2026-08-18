import type { NextConfig } from "next";
import { defaultLocale } from "./src/i18n/config";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /**
       * 파일 업로드가 서버 액션으로 들어온다. 기본 제한이 1MB 라
       * 그대로 두면 우리가 정한 이미지 10MB · PDF 20MB 정책이 동작하지 않고
       * 그 전에 413 으로 끊긴다. (사용자에게는 500 으로 보인다)
       *
       * PDF 20MB 에 multipart 부가 정보와 대체 텍스트가 더 붙으므로 여유를 둔다.
       * nginx 의 client_max_body_size(24m) 보다는 작아야 한다.
       * 그래야 너무 큰 파일이 nginx 에서 잘리지 않고 우리 검증까지 도달해
       * 무엇이 잘못됐는지 한국어로 안내할 수 있다.
       */
      bodySizeLimit: "21mb",
    },
  },

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
