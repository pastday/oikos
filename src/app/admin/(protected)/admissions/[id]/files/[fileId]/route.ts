import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import type { ReadableStream as NodeWebReadableStream } from "node:stream/web";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveAdmissionFilePath } from "@/lib/admission/storage";

/**
 * 입학신청 첨부파일 다운로드. (18단계)
 *
 * ## 공개 `/media/[name]` 과 정반대다
 *
 * | | `/media/[name]` | 여기 |
 * | --- | --- | --- |
 * | 인증 | 없음 | **관리자 로그인 필수** |
 * | 캐시 | `public, max-age=31536000, immutable` | **`no-store`** |
 * | 표시 | 브라우저에서 바로 열림 | **`attachment` (내려받기)** |
 *
 * 여권 사본·성적증명서·서명이 브라우저 캐시에 남거나 주소만으로 열리면 안 된다.
 * 그래서 `inline` 이 아니라 `attachment` 이고, 캐시를 남기지 않는다.
 *
 * ## 왜 Server Action 이 아니라 Route Handler 인가
 *
 * 바이너리를 스트림으로 내보내야 한다. Server Action 의 반환값으로는 할 수 없다.
 *
 * ## 인증
 *
 * `(protected)` layout 아래에 있지만 **Route Handler 는 layout 을 거치지 않는다.**
 * 그래서 여기서 직접 세션을 확인한다. `requireAdmin()` 은 `redirect()` 를 쓰므로
 * 파일 응답에는 맞지 않아 `auth()` 를 직접 부르고 404 를 돌려준다.
 * (403 이 아니라 404 인 이유: 로그인하지 않은 사람에게 그 신청서의 존재를 알리지 않는다)
 */

/** 저장 확장자는 우리가 정하므로 표에서 바로 찾을 수 있다. */
const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

function notFound(): Response {
  return new Response("Not Found", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * 파일명을 `Content-Disposition` 에 안전하게 넣는다.
 *
 * 원본 파일명은 지원자가 정한 값이라 한글·따옴표·줄바꿈이 들어올 수 있다.
 * 그대로 헤더에 넣으면 헤더가 깨지거나 주입될 수 있으므로
 *  - ASCII 대체값: 위험한 문자를 `_` 로 바꾼 것
 *  - `filename*`: RFC 5987 의 UTF-8 인코딩 값
 * 두 가지를 함께 준다.
 */
function contentDisposition(originalName: string): string {
  const fallback = originalName.replace(/[^\w.\-]/g, "_").slice(0, 100) || "file";
  const encoded = encodeURIComponent(originalName);

  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return notFound();

  const { id, fileId } = await params;

  const file = await prisma.admissionFile.findUnique({
    where: { id: fileId },
    select: {
      applicationId: true,
      originalName: true,
      path: true,
      mimeType: true,
    },
  });

  // 다른 신청서의 파일 id 를 이 신청서 주소에 끼워 넣어도 통하지 않게 한다.
  if (!file || file.applicationId !== id) return notFound();

  const filePath = resolveAdmissionFilePath(file.path);
  if (!filePath) return notFound();

  let size: number;

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return notFound();
    size = info.size;
  } catch {
    // DB 에는 있는데 파일이 없는 경우도 여기로 온다.
    return notFound();
  }

  const extension = file.path.split(".").pop() ?? "";
  const contentType =
    CONTENT_TYPES[extension] ?? file.mimeType ?? "application/octet-stream";

  const stream = Readable.toWeb(
    createReadStream(filePath),
  ) as NodeWebReadableStream<Uint8Array>;

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(size),
      "Content-Disposition": contentDisposition(file.originalName),
      // 공용 PC 의 브라우저 캐시에 남지 않게 한다.
      "Cache-Control": "no-store, private",
      // 브라우저가 Content-Type 을 무시하고 내용을 추측하지 못하게 한다.
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
