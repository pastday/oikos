import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { HomeContent } from "@/content/home";
import type { FacultyView } from "@/lib/cms/types";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/navigation";
import { SectionHeading } from "./SectionHeading";

/**
 * 주임교수 Preview.
 *
 * 주임교수 정보는 DB(`Faculty`)에서 읽는다.
 * 사진이 없으면 이니셜 아바타로 표시한다.
 * 전화·이메일은 대표 연락처로 확정되지 않아 노출하지 않는다.
 *
 * 공개된 주임교수가 없으면 이 섹션 자체를 그리지 않는다.
 */
export function FacultyPreview({
  locale,
  content,
  chief,
}: {
  locale: Locale;
  content: HomeContent;
  chief: FacultyView | null;
}) {
  const { faculty } = content;

  if (!chief) return null;

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
            {chief.photo ? (
              <Image
                src={chief.photo.url}
                alt={chief.photo.alt}
                width={80}
                height={80}
                className="mx-auto h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-navy font-serif text-xl font-bold tracking-wide text-gold-soft"
              >
                {chief.initials}
              </span>
            )}

            <h3 className="mt-5 text-xl font-bold text-navy">{chief.name}</h3>
            {chief.nameAlt && (
              <p className="mt-1 text-sm text-muted">{chief.nameAlt}</p>
            )}

            {chief.title && (
              <p className="mt-4 inline-block rounded-full bg-navy-tint px-4 py-1.5 text-xs font-semibold text-navy">
                {chief.title}
              </p>
            )}

            {chief.major && (
              <p className="mt-4 text-sm text-foreground/70">{chief.major}</p>
            )}
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
