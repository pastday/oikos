"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * 미디어 미리보기.
 *
 * DB 행은 있는데 실제 파일이 없을 수 있다. (수동 삭제, 디렉터리 이동 등)
 * 그때 이미지가 깨진 채로 남으면 관리자가 원인을 알 수 없으므로
 * **불러오기에 실패하면 "파일 없음" 으로 바꿔 보여 준다.** (11단계 지시 22항)
 *
 * PDF 는 미리보기를 만들지 않고 문서 표시만 한다.
 * 썸네일을 만들려면 렌더링 라이브러리가 필요한데, 이 단계에서 늘릴 이유가 없다.
 */
export function MediaThumb({
  url,
  kind,
  alt,
  size = "md",
  label,
}: {
  url: string;
  kind: "image" | "pdf" | "document";
  alt: string;
  size?: "sm" | "md";
  /** pdf·document 일 때 배지에 쓸 짧은 라벨. 없으면 kind 기본값. */
  label?: string;
}) {
  const [failed, setFailed] = useState(false);

  const box = cn(
    "flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-surface",
    size === "sm" ? "h-12 w-12" : "h-20 w-20",
  );

  if (kind === "pdf" || kind === "document") {
    return (
      <span className={box} aria-hidden="true">
        <span className="px-1 text-center font-serif text-[0.625rem] font-bold tracking-wide text-navy">
          {label ?? (kind === "pdf" ? "PDF" : "FILE")}
        </span>
      </span>
    );
  }

  if (failed) {
    return (
      <span
        className={cn(box, "border-dashed")}
        title="파일을 찾을 수 없습니다"
      >
        <span className="px-1 text-center text-[0.625rem] leading-tight text-muted">
          파일 없음
        </span>
      </span>
    );
  }

  return (
    <span className={box}>
      {/* 업로드 이미지는 크기를 미리 알 수 없고 최적화 대상도 아니라 img 를 그대로 쓴다. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
