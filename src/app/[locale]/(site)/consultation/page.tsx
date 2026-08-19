import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PendingNotice } from "@/components/form/FormFeedback";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { Section } from "@/components/page/Section";
import { getPageContent } from "@/content/pages";
import { getProgramNumbers } from "@/lib/cms/queries";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";
import { localePath } from "@/lib/navigation";
import { ConsultationForm } from "./ConsultationForm";

const PAGE_PATH = "/consultation";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPageContent(locale, await getProgramNumbers()).consultation;

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: content.intro.title,
    description: content.intro.description,
  });
}

export default async function ConsultationPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const pages = getPageContent(locale, await getProgramNumbers());
  const content = pages.consultation;

  return (
    <>
      <PageHero intro={content.intro} />

      <Section
        title={content.guide.title}
        description={content.guide.description}
      >
        <ul className="grid gap-4 lg:grid-cols-3">
          {content.guide.items.map((item) => (
            <li
              key={item.title}
              className="rounded-lg border border-line bg-background p-5"
            >
              <h3 className="text-[0.9375rem] font-semibold text-navy">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </li>
          ))}
        </ul>

        {/* 대표 전화·카카오톡 채널이 확정되지 않아 버튼을 만들지 않고 안내만 둔다. */}
        <div className="mt-6">
          <PendingNotice title={content.channelNotice.title}>
            {content.channelNotice.body}
          </PendingNotice>
        </div>
      </Section>

      <Section
        title={content.form.title}
        description={content.form.description}
        tone="surface"
      >
        <div className="max-w-3xl">
          <ConsultationForm locale={locale} content={content.form} />
        </div>
      </Section>

      <section className="border-b border-line bg-background py-12 lg:py-14">
        <Container>
          <div className="flex flex-col gap-5 rounded-lg border border-line bg-surface px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="max-w-xl">
              <h2 className="font-serif text-lg font-bold text-navy">
                {content.seminarLink.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {content.seminarLink.description}
              </p>
            </div>

            <Link
              href={localePath(locale, "/consultation/seminar")}
              className="inline-flex shrink-0 justify-center rounded-md border border-navy px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              {content.seminarLink.cta}
            </Link>
          </div>
        </Container>
      </section>

      <RelatedLinks
        locale={locale}
        title={pages.related.title}
        links={[
          { path: "/admission", label: pages.related.admission },
          { path: "/programs", label: pages.related.programs },
          { path: "/faq", label: pages.related.faq },
          {
            path: "/consultation/seminar",
            label: pages.related.seminar,
            primary: true,
          },
        ]}
      />
    </>
  );
}
