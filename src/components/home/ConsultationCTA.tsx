import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/navigation";

/** 페이지 하단 입학상담 CTA. 과도한 영업성 문구를 쓰지 않는다. */
export function ConsultationCTA({
  locale,
  content,
}: {
  locale: Locale;
  content: HomeContent;
}) {
  const { consultation } = content;

  return (
    <section className="bg-navy py-16 text-white lg:py-20">
      <Container>
        <div className="flex flex-col items-start gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl font-bold text-balance sm:text-3xl">
              {consultation.title}
            </h2>
            <p className="mt-3 leading-relaxed text-white/80">
              {consultation.description}
            </p>
          </div>

          <Link
            href={localePath(locale, "/consultation")}
            className="inline-flex shrink-0 justify-center rounded-md bg-gold px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gold-soft hover:text-navy"
          >
            {consultation.cta}
          </Link>
        </div>
      </Container>
    </section>
  );
}
