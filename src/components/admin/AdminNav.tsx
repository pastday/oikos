"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/**
 * 관리자 사이드바 메뉴.
 *
 * 아직 만들지 않은 화면은 **링크로 만들지 않는다.** 404 링크를 잔뜩 두면
 * 무엇이 동작하는 기능인지 알 수 없게 된다. 대신 "준비 중" 으로 표시하고 클릭을 막는다.
 */

type NavItem = {
  label: string;
  /** 아직 화면이 없으면 undefined. 이 경우 링크가 아니라 비활성 항목으로 그린다. */
  href?: string;
  /** 어느 단계에서 만들 예정인지. 화면에 표시해 진행 상황을 알 수 있게 한다. */
  plannedStage?: string;
};

type NavGroup = { title: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: "현황",
    items: [{ label: "대시보드", href: "/admin" }],
  },
  {
    title: "상담 관리",
    items: [
      { label: "입학상담", href: "/admin/consultations" },
      { label: "설명회 신청", href: "/admin/seminars" },
    ],
  },
  {
    title: "콘텐츠 관리",
    items: [
      { label: "교수진", href: "/admin/faculty" },
      { label: "MBA · DBA 과정", href: "/admin/programs" },
      { label: "교과목", href: "/admin/courses" },
      { label: "페이지 콘텐츠", plannedStage: "예정" },
      { label: "입학안내", plannedStage: "예정" },
      { label: "FAQ", plannedStage: "예정" },
    ],
  },
  {
    title: "시스템",
    items: [{ label: "관리자 계정", plannedStage: "예정" }],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="관리자 메뉴" className="flex flex-col gap-6">
      {navGroups.map((group) => (
        <div key={group.title}>
          <h2 className="px-3 text-[0.6875rem] font-semibold tracking-[0.12em] text-white/40 uppercase">
            {group.title}
          </h2>

          <ul className="mt-2 flex flex-col gap-0.5">
            {group.items.map((item) => {
              if (!item.href) {
                return (
                  <li key={item.label}>
                    <span
                      aria-disabled="true"
                      className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-white/35"
                    >
                      {item.label}
                      <span className="shrink-0 rounded border border-white/15 px-1.5 py-0.5 text-[0.625rem] text-white/35">
                        {item.plannedStage}
                      </span>
                    </span>
                  </li>
                );
              }

              // 상세 화면(/admin/consultations/xxx)에서도 상위 메뉴가 활성으로 보이게 한다.
              // 대시보드(/admin)는 하위 경로를 모두 삼키므로 정확히 일치할 때만 활성이다.
              const isActive =
                item.href === "/admin"
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-white/15 font-semibold text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
