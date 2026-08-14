import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { Section } from "@/components/page/Section";
import { getPageContent } from "@/content/pages";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";

const PAGE_PATH = "/faculty";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPageContent(locale).faculty;

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: content.intro.title,
    description: content.intro.description,
  });
}

/**
 * 교수진 페이지.
 * 현재 원본 자료에서 확인되는 교수는 주임교수 1인뿐이다.
 * 없는 교수를 만들거나 "준비 중" 카드를 여러 개 두지 않는다.
 * 명함의 연락처·주소는 노출하지 않는다.
 */
export default async function FacultyPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const pages = getPageContent(locale);
  const content = pages.faculty;
  const { chief } = content;

  return (
    <>
      <PageHero intro={content.intro} />

      <Section title={chief.sectionTitle}>
        <article className="grid gap-8 rounded-xl border border-line bg-surface p-7 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-10 sm:p-9">
          <span
            aria-hidden="true"
            className="flex h-24 w-24 items-center justify-center rounded-full bg-navy font-serif text-2xl font-bold tracking-wide text-gold-soft"
          >
            {chief.initials}
          </span>

          <div className="min-w-0">
            <h3 className="text-2xl font-bold text-navy">{chief.name}</h3>
            <p className="mt-1 text-sm text-muted">{chief.nameAlt}</p>

            <p className="mt-4 inline-block rounded-full bg-navy-tint px-4 py-1.5 text-xs font-semibold text-navy">
              {chief.role}
            </p>

            <dl className="mt-6 grid gap-x-8 gap-y-3 border-t border-line pt-6 sm:grid-cols-2">
              {chief.details.map((detail) => (
                <div key={detail.label} className="flex gap-3 text-sm">
                  <dt className="w-20 shrink-0 text-muted">{detail.label}</dt>
                  <dd className="font-medium text-foreground/85">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </article>

        <p className="mt-5 text-xs text-muted">{content.contactNotice}</p>
      </Section>

      <Section tone="surface">
        <div className="rounded-lg border border-dashed border-line bg-background px-6 py-7">
          <h2 className="text-base font-semibold text-navy">
            {content.pendingNotice.title}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {content.pendingNotice.body}
          </p>
        </div>
      </Section>

      <RelatedLinks
        locale={locale}
        title={pages.related.title}
        links={[
          { path: "/programs", label: pages.related.programs },
          { path: "/about", label: pages.related.about },
          {
            path: "/consultation",
            label: pages.related.consultation,
            primary: true,
          },
        ]}
      />
    </>
  );
}
