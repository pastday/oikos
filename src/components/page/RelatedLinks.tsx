import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/navigation";

export type RelatedLink = {
  /** locale prefix 를 제외한 경로 */
  path: string;
  label: string;
  /** 강조 표시할 링크 (보통 입학상담) */
  primary?: boolean;
};

/** 페이지 하단에서 관련 페이지로 연결한다. */
export function RelatedLinks({
  locale,
  title,
  links,
}: {
  locale: Locale;
  title: string;
  links: RelatedLink[];
}) {
  return (
    <section className="bg-navy py-12 text-white lg:py-14">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-lg font-bold">{title}</h2>

          <ul className="flex flex-wrap gap-3">
            {links.map((link) => (
              <li key={link.path}>
                <Link
                  href={localePath(locale, link.path)}
                  className={
                    link.primary
                      ? "inline-flex rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-soft hover:text-navy"
                      : "inline-flex rounded-md border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                  }
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
