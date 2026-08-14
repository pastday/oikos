"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive, type ResolvedNavItem } from "@/lib/navigation";
import { cn } from "@/lib/cn";

/**
 * 데스크톱 주요 메뉴 (Header 2행).
 * 현재 위치 표시를 위해 pathname 이 필요하므로 Client Component 로 분리한다.
 * 표시 여부(xl 이상)는 Header 에서 제어한다.
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
    <nav aria-label={label}>
      <ul className="-mx-3.5 flex items-center">
        {items.map((item) => {
          const isActive = isNavItemActive(pathname, item);

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative block px-3.5 py-3.5 text-[0.9375rem] font-medium whitespace-nowrap transition-colors",
                  isActive ? "text-navy" : "text-foreground/75 hover:text-navy",
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-3.5 bottom-0 h-0.5 rounded-full bg-gold transition-opacity",
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
