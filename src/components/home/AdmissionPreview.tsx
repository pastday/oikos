import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/navigation";
import { SectionHeading } from "./SectionHeading";

/**
 * 입학안내 Preview.
 * 등록금 전체 표는 메인에 넣지 않고 /admission 페이지에서 다룬다. (지시 16항)
 */
export function AdmissionPreview({
  locale,
  content,
}: {
  locale: Locale;
  content: HomeContent;
}) {
  const { admission } = content;

  return (
    <section className="bg-surface py-16 lg:py-24">
      <Container>
        <SectionHeading
          eyebrow={admission.eyebrow}
          title={admission.title}
          description={admission.description}
          align="center"
        />

        <dl className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {admission.items.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-line bg-background px-5 py-6 text-center"
            >
              <dt className="text-xs font-medium tracking-wide text-muted">
                {item.label}
              </dt>
              <dd className="mt-2 text-base font-bold text-navy sm:text-lg">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={localePath(locale, "/admission")}
            className="inline-flex justify-center rounded-md border border-navy px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
          >
            {admission.ctaGuide}
          </Link>
          <Link
            href={localePath(locale, "/consultation")}
            className="inline-flex justify-center rounded-md bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
          >
            {admission.ctaConsultation}
          </Link>
        </div>
      </Container>
    </section>
  );
}
