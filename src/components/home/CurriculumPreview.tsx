import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/navigation";
import { SectionHeading } from "./SectionHeading";

/**
 * 교육과정 Preview.
 * 전체 교과목을 메인에 나열하지 않고 대표 6과목만 보여준다. (지시 12항)
 * 교과목명은 원본 문서 표기를 그대로 사용한다.
 */
export function CurriculumPreview({
  locale,
  content,
}: {
  locale: Locale;
  content: HomeContent;
}) {
  const { curriculum } = content;

  return (
    <section className="border-b border-line bg-background py-16 lg:py-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={curriculum.eyebrow}
            title={curriculum.title}
            description={curriculum.description}
          />

          <Link
            href={localePath(locale, "/programs")}
            className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
          >
            {curriculum.cta}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {curriculum.courses.map((course, index) => (
            <li
              key={course.title}
              className="group rounded-lg border border-line bg-surface p-6 transition-colors hover:border-navy/30"
            >
              <span className="font-serif text-sm font-bold text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-[0.9375rem] leading-snug font-semibold text-navy">
                {course.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {course.subtitle}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-muted">{curriculum.note}</p>
      </Container>
    </section>
  );
}
