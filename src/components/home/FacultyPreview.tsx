import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/navigation";
import { SectionHeading } from "./SectionHeading";

/**
 * 주임교수 Preview.
 *
 * 프로필 사진이 제공되지 않았으므로 명함 이미지를 사진 대신 사용하지 않고
 * 이니셜 아바타로 표시한다.
 * 전화·이메일·주소는 대표 연락처로 확정되지 않아 노출하지 않는다. (지시 14항)
 */
export function FacultyPreview({
  locale,
  content,
}: {
  locale: Locale;
  content: HomeContent;
}) {
  const { faculty } = content;
  const { chief } = faculty;

  return (
    <section className="bg-surface py-16 lg:py-24">
      <Container>
        <SectionHeading
          eyebrow={faculty.eyebrow}
          title={faculty.title}
          description={faculty.description}
          align="center"
        />

        <div className="mt-10 flex justify-center">
          <article className="w-full max-w-md rounded-xl border border-line bg-background p-8 text-center">
            <span
              aria-hidden="true"
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-navy font-serif text-xl font-bold tracking-wide text-gold-soft"
            >
              {chief.initials}
            </span>

            <h3 className="mt-5 text-xl font-bold text-navy">{chief.name}</h3>
            <p className="mt-1 text-sm text-muted">{chief.nameEn}</p>

            <p className="mt-4 inline-block rounded-full bg-navy-tint px-4 py-1.5 text-xs font-semibold text-navy">
              {chief.title}
            </p>

            <p className="mt-4 text-sm text-foreground/70">
              {chief.affiliation}
            </p>
          </article>
        </div>

        <div className="mt-8 text-center">
          <Link
            href={localePath(locale, "/faculty")}
            className="inline-flex items-center gap-1.5 rounded-md border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
          >
            {faculty.cta}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
