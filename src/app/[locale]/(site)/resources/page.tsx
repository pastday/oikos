import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/page/Section";
import { getDictionary } from "@/i18n";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/lib/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import {
  getPublishedResourceList,
  type ResourceListItem,
} from "@/lib/cms/resources";

const PAGE_PATH = "/resources";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: dict.resources.title,
    description: dict.resources.description,
  });
}

/**
 * 자료실 목록. (A안)
 *
 * 자료는 DB(`ResourcePost`)에서 읽으며 최신 등록이 먼저 온다.
 * 학교소식(`NewsPost`)과는 별개 기능이다. (자료실 지시 27항)
 */
export default async function ResourceListPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const resources = await getPublishedResourceList(locale);

  return (
    <>
      <PageHero
        intro={{
          eyebrow: dict.site.wordmark,
          title: dict.resources.title,
          description: dict.resources.description,
        }}
      />

      <Section>
        {resources.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center">
            <p className="text-sm text-muted">{dict.resources.empty}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {resources.map((resource) => (
              <li key={resource.id}>
                <ResourceRow
                  resource={resource}
                  locale={locale}
                  fileCountLabel={dict.resources.fileCountLabel}
                  viewDetail={dict.resources.viewDetail}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

function ResourceRow({
  resource,
  locale,
  fileCountLabel,
  viewDetail,
}: {
  resource: ResourceListItem;
  locale: Locale;
  fileCountLabel: string;
  viewDetail: string;
}) {
  return (
    <Link
      href={localePath(locale, `/resources/${resource.slug}`)}
      className="group flex flex-col gap-2 rounded-lg border border-line bg-background p-5 transition-colors hover:border-navy/40 sm:flex-row sm:items-center sm:gap-6"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          <span className="rounded-full bg-navy-tint px-2.5 py-0.5 font-semibold text-navy">
            {resource.categoryLabel}
          </span>
          <time dateTime={resource.publishedAtAttr} className="text-muted">
            {resource.publishedOn}
          </time>
          <span className="text-muted">
            {fileCountLabel.replace(
              "{count}",
              String(resource.attachmentCount),
            )}
          </span>
        </div>

        <h2 className="mt-1.5 font-serif text-lg leading-snug font-bold break-words text-navy group-hover:underline">
          {resource.title}
        </h2>

        {resource.summary && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed break-words text-foreground/75">
            {resource.summary}
          </p>
        )}
      </div>

      <span className="shrink-0 self-start rounded-md border border-navy px-4 py-2 text-xs font-semibold whitespace-nowrap text-navy transition-colors group-hover:bg-navy group-hover:text-white sm:self-center">
        {viewDetail}
      </span>
    </Link>
  );
}
