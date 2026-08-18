import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import type { ReadableStream as NodeWebReadableStream } from "node:stream/web";
import { resolveStoredPath } from "@/lib/media/storage";

/**
 * 업로드 파일 서빙.
 *
 * 파일이 `public/` 밖(`oikos-data/uploads`)에 있어 Next.js 가 자동으로 내보내지 않는다.
 * 이 라우트가 읽어서 내보낸다.
 *
 * ## 안전
 *
 * `resolveStoredPath` 가 **우리가 만든 이름 형식(UUID + 정해진 확장자)만** 통과시킨다.
 * 형식에 맞지 않으면 경로 자체를 만들지 않으므로 `../` 로 다른 파일을 읽어 갈 수 없다.
 * 목록을 내보내는 경로가 없으므로 디렉터리 나열도 되지 않는다.
 *
 * ## 왜 인증을 걸지 않는가
 *
 * 공개 학교 홈페이지의 교수 사진·모집요강처럼 **누구나 봐야 하는 자료**만 올린다.
 * 민감 문서는 애초에 업로드 대상이 아니다. (11단계 지시 12항)
 */

/** 저장 확장자는 우리가 정하므로 표에서 바로 찾을 수 있다. */
const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  const filePath = resolveStoredPath(name);
  if (!filePath) {
    return new Response("Not Found", { status: 404 });
  }

  let size: number;

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new Response("Not Found", { status: 404 });
    size = info.size;
  } catch {
    // DB 에는 있는데 파일이 없는 경우도 여기로 온다. 관리자 화면이 이 404 를 보고
    // "파일 없음" 으로 표시한다. (11단계 지시 22항)
    return new Response("Not Found", { status: 404 });
  }

  const extension = name.split(".").pop() ?? "";
  const contentType = CONTENT_TYPES[extension] ?? "application/octet-stream";

  const stream = Readable.toWeb(
    createReadStream(filePath),
  ) as NodeWebReadableStream<Uint8Array>;

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(size),
      // 저장 파일명이 UUID 라 내용이 바뀌면 이름도 바뀐다. 길게 캐시해도 안전하다.
      "Cache-Control": "public, max-age=31536000, immutable",
      // 브라우저가 Content-Type 을 무시하고 내용을 추측하지 못하게 한다.
      "X-Content-Type-Options": "nosniff",
      // 혹시 모를 내장 스크립트 실행을 막는다. 이미지와 PDF 에는 영향이 없다.
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; object-src 'none'",
    },
  });
}
