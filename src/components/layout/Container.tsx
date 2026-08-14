import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** 페이지 콘텐츠의 최대 폭과 좌우 여백을 사이트 전체에서 통일한다. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-site px-5 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
