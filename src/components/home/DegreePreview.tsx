import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/navigation";

/**
 * 학위 및 인증 Preview.
 * BPPE / TRACS / CHEA / SEVIS 등 세부 인증 내용은 메인에 나열하지 않고
 * /degree 페이지에서 다룬다. (지시 15항)
 */
export function DegreePreview({
  locale,
  content,
}: {
  locale: Locale;
  content: HomeContent;
}) {
  const { degree } = content;

  return (
    <section className="border-b border-line bg-background py-14 lg:py-16">
      <Container>
        <div className="flex flex-col gap-6 rounded-xl border border-line bg-beige px-7 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
              {degree.eyebrow}
            </p>
            <h2 className="mt-2.5 font-serif text-xl font-bold text-navy sm:text-2xl">
              {degree.title}
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-foreground/70">
              {degree.description}
            </p>
          </div>

          <Link
            href={localePath(locale, "/degree")}
            className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
          >
            {degree.cta}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
