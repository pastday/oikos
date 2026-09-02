import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import type { ReadableStream as NodeWebReadableStream } from "node:stream/web";
import { prisma } from "@/lib/prisma";
import { resolveStoredPath } from "@/lib/media/storage";
import { CONTENT_TYPE_BY_EXTENSION } from "@/lib/media/url";

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
 * 서버의 실제 물리 경로(`/home/pastday/...`)는 응답에 절대 담기지 않는다. (자료실 지시 8항)
 *
 * ## 왜 인증을 걸지 않는가
 *
 * 공개 학교 홈페이지의 교수 사진·모집요강·입학 서식처럼 **누구나 봐야 하는 자료**만 올린다.
 * 민감 문서는 애초에 업로드 대상이 아니다. (11단계 지시 12항)
 *
 * ## `?dl` — 다운로드로 강제
 *
 * 기본 동작은 그대로다. (이미지·PDF 는 브라우저에서 바로 열림 — 기존 화면 회귀 방지)
 * 자료실 첨부파일 링크는 `?dl=1` 을 붙여 요청하며, 그때만
 * `Content-Disposition: attachment` 로 **원본 파일명(한글 포함)** 을 붙여 내려보낸다.
 * 한글이 깨지지 않도록 `filename*` (RFC 5987, UTF-8) 을 함께 쓴다.
 */

/** 원본 파일명을 Content-Disposition 헤더 값으로 만든다. ASCII fallback + UTF-8 both. */
function attachmentDisposition(originalName: string): string {
  const safe = originalName || "download";
  // 헤더에 그대로 넣을 수 없는 문자(비 ASCII·따옴표·역슬래시·제어문자)는 `_` 로.
  const asciiFallback =
    safe.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_") || "download";
  const encoded = encodeURIComponent(safe);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

export async function GET(
  request: Request,
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

  // 저장한 MIME·원본 파일명은 DB 가 정확하다. 없으면 확장자로 추정한다.
  const media = await prisma.media
    .findUnique({
      where: { storedName: name },
      select: { mimeType: true, originalName: true },
    })
    .catch(() => null);

  const extension = name.split(".").pop() ?? "";
  const contentType =
    media?.mimeType ??
    CONTENT_TYPE_BY_EXTENSION[extension] ??
    "application/octet-stream";

  const wantsDownload = new URL(request.url).searchParams.get("dl") !== null;

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Length": String(size),
    // 저장 파일명이 UUID 라 내용이 바뀌면 이름도 바뀐다. 길게 캐시해도 안전하다.
    "Cache-Control": "public, max-age=31536000, immutable",
    // 브라우저가 Content-Type 을 무시하고 내용을 추측하지 못하게 한다.
    "X-Content-Type-Options": "nosniff",
    // 혹시 모를 내장 스크립트 실행을 막는다. 이미지·PDF·문서에는 영향이 없다.
    "Content-Security-Policy":
      "default-src 'none'; img-src 'self'; object-src 'none'",
  };

  if (wantsDownload) {
    headers["Content-Disposition"] = attachmentDisposition(
      media?.originalName ?? name,
    );
  }

  const stream = Readable.toWeb(
    createReadStream(filePath),
  ) as NodeWebReadableStream<Uint8Array>;

  return new Response(stream as unknown as ReadableStream, { headers });
}
