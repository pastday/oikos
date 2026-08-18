/**
 * 업로드 파일 검증.
 *
 * ## 확장자와 브라우저가 알려준 MIME 을 믿지 않는다
 *
 * 둘 다 사용자가 마음대로 바꿀 수 있다. `evil.html` 을 `photo.jpg` 로 이름만 바꿔
 * `image/jpeg` 라고 보내는 것이 가능하다.
 * 그래서 **파일 앞부분의 signature(magic bytes)로 실제 형식을 판정하고**,
 * 저장 확장자도 그 판정 결과에서 만든다. 사용자가 준 이름은 표시용으로만 남긴다.
 *
 * ## SVG 를 받지 않는 이유
 *
 * SVG 는 이미지처럼 보이지만 `<script>` 를 품을 수 있는 XML 문서다.
 * 같은 출처에서 열리면 XSS 가 된다. (CLAUDE.md 18항)
 * 이번 단계에서는 아예 허용하지 않는다.
 */

export type MediaKind = "image" | "pdf";

export type AllowedType = {
  /** 저장 파일명에 쓸 확장자 */
  extension: "jpg" | "png" | "webp" | "pdf";
  mimeType: string;
  kind: MediaKind;
  label: string;
};

/** 이미지 10MB */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
/** PDF 20MB. nginx 의 client_max_body_size(24m) 안에 들어가야 한다. */
export const MAX_PDF_BYTES = 20 * 1024 * 1024;

export function maxBytesFor(kind: MediaKind): number {
  return kind === "pdf" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 업로드 화면의 accept 속성. 편의 장치이며 검증은 서버가 한다. */
export const ACCEPT_ATTRIBUTE = "image/jpeg,image/png,image/webp,application/pdf";

// ---------------------------------------------------------------------------

function startsWith(buffer: Uint8Array, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false;
  return bytes.every((byte, index) => buffer[index] === byte);
}

/**
 * 파일 앞부분을 보고 실제 형식을 판정한다. 모르는 형식이면 null.
 *
 * WebP 는 RIFF 컨테이너라 앞 4바이트가 "RIFF", 8~11바이트가 "WEBP" 다.
 * 두 곳을 모두 봐야 다른 RIFF 파일(wav 등)과 구분된다.
 */
export function detectType(buffer: Uint8Array): AllowedType | null {
  // JPEG: FF D8 FF
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) {
    return {
      extension: "jpg",
      mimeType: "image/jpeg",
      kind: "image",
      label: "JPEG 이미지",
    };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return {
      extension: "png",
      mimeType: "image/png",
      kind: "image",
      label: "PNG 이미지",
    };
  }

  // WebP: "RIFF" .... "WEBP"
  if (
    startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) &&
    buffer.length >= 12 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return {
      extension: "webp",
      mimeType: "image/webp",
      kind: "image",
      label: "WebP 이미지",
    };
  }

  // PDF: "%PDF-"
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
    return {
      extension: "pdf",
      mimeType: "application/pdf",
      kind: "pdf",
      label: "PDF 문서",
    };
  }

  return null;
}

/** 저장된 MIME 으로 종류를 되돌린다. 목록 화면이 미리보기를 고를 때 쓴다. */
export function kindFromMimeType(mimeType: string): MediaKind {
  return mimeType === "application/pdf" ? "pdf" : "image";
}

// ---------------------------------------------------------------------------

export type ValidationFailure = { ok: false; message: string };
export type ValidationSuccess = {
  ok: true;
  type: AllowedType;
  bytes: Uint8Array;
};

export const UPLOAD_HELP =
  "JPEG · PNG · WebP 이미지(최대 10MB) 또는 PDF 문서(최대 20MB)만 올릴 수 있습니다.";

/**
 * 업로드된 파일 하나를 검증한다.
 *
 * 크기를 먼저 보고 내용을 나중에 본다. 20MB 를 넘는 파일을 메모리로 읽어들인 뒤
 * 거절하면 큰 파일을 계속 보내는 것만으로 서버를 흔들 수 있기 때문이다.
 */
export async function validateUpload(
  file: File,
): Promise<ValidationSuccess | ValidationFailure> {
  if (file.size === 0) {
    return { ok: false, message: "빈 파일은 올릴 수 없습니다." };
  }

  // 아직 형식을 모르므로 가장 큰 허용치로 1차 차단한다. 형식을 안 뒤 다시 본다.
  if (file.size > MAX_PDF_BYTES) {
    return {
      ok: false,
      message: `파일이 너무 큽니다. (${formatBytes(file.size)}) ${UPLOAD_HELP}`,
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectType(bytes);

  if (!type) {
    return {
      ok: false,
      message: `허용되지 않는 파일 형식입니다. ${UPLOAD_HELP}`,
    };
  }

  const limit = maxBytesFor(type.kind);
  if (file.size > limit) {
    return {
      ok: false,
      message: `${type.label}는 최대 ${formatBytes(limit)} 까지 올릴 수 있습니다. (올린 파일 ${formatBytes(file.size)})`,
    };
  }

  return { ok: true, type, bytes };
}
