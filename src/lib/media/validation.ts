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
 * ## 문서 파일(HWP/DOC/XLS/PPT 등)은 어떻게 판정하는가 (자료실 지시 7항)
 *
 * 오피스 문서는 magic bytes 만으로 세부 형식을 구분할 수 없다.
 *  - `.hwp/.doc/.xls/.ppt`   → 전부 **OLE2 복합문서**(`D0CF11E0…`)
 *  - `.hwpx/.docx/.xlsx/.pptx` → 전부 **ZIP 컨테이너**(`PK…`)
 *
 * 그래서 **컨테이너 종류는 magic bytes 로 확인**(OLE2 인지 ZIP 인지)하고,
 * **세부 형식은 사용자가 준 확장자**로 정한다. 단, 확장자는 허용 목록에 있는 것만 통과한다.
 * 이렇게 하면 HTML·스크립트처럼 컨테이너가 아닌 파일은 애초에 걸러지고,
 * `.docx` 로 위장한 `.exe` 도 (ZIP 이 아니면) 통과하지 못한다.
 *
 * ## SVG 를 받지 않는 이유
 *
 * SVG 는 이미지처럼 보이지만 `<script>` 를 품을 수 있는 XML 문서다.
 * 같은 출처에서 열리면 XSS 가 된다. (CLAUDE.md 18항)
 */

export type MediaKind = "image" | "pdf" | "document";

export type AllowedType = {
  /** 저장 파일명에 쓸 확장자. `isSafeStoredName` 의 허용 목록과 반드시 일치해야 한다. */
  extension: string;
  mimeType: string;
  kind: MediaKind;
  label: string;
};

/** 이미지 10MB */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
/** PDF 20MB. nginx 의 client_max_body_size(24m) 안에 들어가야 한다. */
export const MAX_PDF_BYTES = 20 * 1024 * 1024;
/** 문서(HWP/DOC/XLS/PPT 등) 20MB. PDF 와 같은 한도를 쓴다. */
export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

export function maxBytesFor(kind: MediaKind): number {
  if (kind === "pdf") return MAX_PDF_BYTES;
  if (kind === "document") return MAX_DOCUMENT_BYTES;
  return MAX_IMAGE_BYTES;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 업로드 화면의 accept 속성. 편의 장치이며 검증은 서버가 한다.
 * 확장자와 MIME 을 함께 적어 두어야 OS 별로 파일 선택창이 문서 파일을 걸러 준다.
 */
export const ACCEPT_ATTRIBUTE = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  ".hwp",
  ".hwpx",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  "application/msword",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
].join(",");

// ---------------------------------------------------------------------------

function startsWith(buffer: Uint8Array, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false;
  return bytes.every((byte, index) => buffer[index] === byte);
}

/** OLE2 복합문서(구형 HWP·DOC·XLS·PPT). */
const OLE2_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
/** ZIP 컨테이너(HWPX·DOCX·XLSX·PPTX). 로컬헤더 / 빈 아카이브 / 분할 아카이브. */
const ZIP_MAGICS = [
  [0x50, 0x4b, 0x03, 0x04],
  [0x50, 0x4b, 0x05, 0x06],
  [0x50, 0x4b, 0x07, 0x08],
];

/** OLE2 컨테이너로 들어오는 문서. 세부 형식은 확장자로 정한다. */
const OLE2_DOCUMENTS: Record<string, { mimeType: string; label: string }> = {
  hwp: { mimeType: "application/x-hwp", label: "한글(HWP) 문서" },
  doc: { mimeType: "application/msword", label: "Word(DOC) 문서" },
  xls: { mimeType: "application/vnd.ms-excel", label: "Excel(XLS) 문서" },
  ppt: {
    mimeType: "application/vnd.ms-powerpoint",
    label: "PowerPoint(PPT) 문서",
  },
};

/** ZIP 컨테이너로 들어오는 문서. */
const ZIP_DOCUMENTS: Record<string, { mimeType: string; label: string }> = {
  hwpx: { mimeType: "application/vnd.hancom.hwpx", label: "한글(HWPX) 문서" },
  docx: {
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "Word(DOCX) 문서",
  },
  xlsx: {
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    label: "Excel(XLSX) 문서",
  },
  pptx: {
    mimeType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    label: "PowerPoint(PPTX) 문서",
  },
};

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot + 1).toLowerCase() : "";
}

/**
 * 파일 앞부분을 보고 **이미지·PDF** 형식을 판정한다. 모르는 형식이면 null.
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

/**
 * **문서 파일**을 판정한다. 컨테이너(OLE2/ZIP)는 magic bytes 로, 세부 형식은 확장자로.
 * 허용 목록에 없는 확장자거나 컨테이너가 맞지 않으면 null.
 */
export function detectDocument(
  buffer: Uint8Array,
  filename: string,
): AllowedType | null {
  const ext = extensionOf(filename);
  const isOle2 = startsWith(buffer, OLE2_MAGIC);
  const isZip = ZIP_MAGICS.some((magic) => startsWith(buffer, magic));

  if (isOle2 && OLE2_DOCUMENTS[ext]) {
    return { extension: ext, kind: "document", ...OLE2_DOCUMENTS[ext] };
  }
  if (isZip && ZIP_DOCUMENTS[ext]) {
    return { extension: ext, kind: "document", ...ZIP_DOCUMENTS[ext] };
  }
  return null;
}

/** 저장된 MIME 으로 종류를 되돌린다. 목록 화면이 미리보기를 고를 때 쓴다. */
export function kindFromMimeType(mimeType: string): MediaKind {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  return "document";
}

// ---------------------------------------------------------------------------

export type ValidationFailure = { ok: false; message: string };
export type ValidationSuccess = {
  ok: true;
  type: AllowedType;
  bytes: Uint8Array;
};

export const UPLOAD_HELP =
  "이미지(JPEG · PNG · WebP, 최대 10MB), PDF, 문서(HWP · HWPX · DOC · DOCX · XLS · XLSX · PPT · PPTX, 최대 20MB)를 올릴 수 있습니다.";

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
  const overallMax = Math.max(MAX_IMAGE_BYTES, MAX_PDF_BYTES, MAX_DOCUMENT_BYTES);
  if (file.size > overallMax) {
    return {
      ok: false,
      message: `파일이 너무 큽니다. (${formatBytes(file.size)}) ${UPLOAD_HELP}`,
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectType(bytes) ?? detectDocument(bytes, file.name);

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
