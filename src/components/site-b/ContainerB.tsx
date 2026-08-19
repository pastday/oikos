import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * B안 지면 폭.
 *
 * A안(76rem)보다 넓고 좌우 여백이 크다. 같은 콘텐츠라도 지면 비율이 달라지면
 * 첫인상이 크게 달라지므로, B안의 "넓고 여백이 많은" 성격을 여기서 한 번에 정한다.
 */
export function ContainerB({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-site-b px-6 sm:px-10 lg:px-16",
        className,
      )}
    >
      {children}
    </div>
  );
}
