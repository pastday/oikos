"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive, type ResolvedNavItem } from "@/lib/navigation";
import { cn } from "@/lib/cn";

/**
 * 데스크톱 상단 메뉴.
 * 현재 위치 표시를 위해 pathname 이 필요하므로 Client Component 로 분리한다.
 * Header 자체는 Server Component 로 유지한다.
 */
export function DesktopNav({
  items,
  label,
}: {
  items: ResolvedNavItem[];
  label: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="hidden lg:block">
      <ul className="flex items-center gap-1 xl:gap-2">
        {items.map((item) => {
          const isActive = isNavItemActive(pathname, item);

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative block rounded px-3 py-2 text-[0.9375rem] font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "text-navy"
                    : "text-foreground/80 hover:text-navy",
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gold transition-opacity",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
