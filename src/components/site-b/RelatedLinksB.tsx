import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { ContainerB } from "./ContainerB";
import { bPath } from "./paths";

export type RelatedLinkB = {
  /** locale 과 design-b 를 제외한 경로 */
  path: string;
  label: string;
  /** 강조 표시할 링크 (보통 입학상담) */
  primary?: boolean;
};

/**
 * 페이지 하단 관련 링크.
 *
 * 링크 목록과 문구는 A안과 같은 것을 쓰고 **경로만 B안으로 만든다.**
 * (`bPath`) 그래야 B안을 둘러보다 A안으로 빠져나가지 않는다. (13단계 지시 24항)
 */
export function RelatedLinksB({
  locale,
  title,
  links,
}: {
  locale: Locale;
  title: string;
  links: RelatedLinkB[];
}) {
  return (
    <section className="border-t border-rule bg-paper-2 py-16 lg:py-20">
      <ContainerB>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="font-serif text-2xl font-bold text-ink">{title}</h2>

          <ul className="flex flex-wrap gap-3">
            {links.map((link) => (
              <li key={link.path}>
                <Link
                  href={bPath(locale, link.path)}
                  className={cn(
                    "inline-flex px-6 py-3.5 text-xs font-semibold tracking-[0.12em] uppercase transition-colors",
                    link.primary
                      ? "bg-ink text-white hover:bg-ink-3"
                      : "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </ContainerB>
    </section>
  );
}
