import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BSection } from "@/components/site-b/BLayout";
import { BPageHero } from "@/components/site-b/BPageHero";
import { BEyebrow, BHeadline, BLead } from "@/components/site-b/BType";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { getDictionary } from "@/i18n";
import { isLocale, type Locale } from "@/i18n/config";
import { bPath } from "@/components/site-b/paths";
import {
  getPublishedResourceList,
  type ResourceListItem,
} from "@/lib/cms/resources";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);

  return buildDesignBMetadata({
    title: dict.resources.title,
    description: dict.resources.description,
  });
}

/**
 * 자료실 목록. (B안)
 * 데이터·조회는 A안과 **똑같은 코드**(`getPublishedResourceList`). 조판만 다르다.
 */
export default async function DesignBResourceListPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const resources = await getPublishedResourceList(locale);

  return (
    <>
      <BPageHero
        intro={{
          eyebrow: dict.site.wordmark,
          title: dict.resources.title,
          description: dict.resources.description,
        }}
        index={3}
        watermark={dict.site.wordmark}
      />

      <BSection index={1} label={dict.resources.title} tone="paper">
        <BHeadline>{dict.resources.title}</BHeadline>
        <BLead className="mt-6 max-w-2xl">{dict.resources.description}</BLead>

        {resources.length === 0 ? (
          <p className="mt-14 border-l-2 border-rule-2 py-1 pl-6 text-sm text-quiet">
            {dict.resources.empty}
          </p>
        ) : (
          <ul className="mt-14 border-t border-rule-2/60">
            {resources.map((resource, index) => (
              <li key={resource.id} className="border-b border-rule-2/60">
                <BResourceRow
                  resource={resource}
                  locale={locale}
                  index={index + 1}
                  fileCountLabel={dict.resources.fileCountLabel}
                />
              </li>
            ))}
          </ul>
        )}
      </BSection>
    </>
  );
}

function BResourceRow({
  resource,
  locale,
  index,
  fileCountLabel,
}: {
  resource: ResourceListItem;
  locale: Locale;
  index: number;
  fileCountLabel: string;
}) {
  return (
    <Link
      href={bPath(locale, `/resources/${resource.slug}`)}
      className="group grid gap-4 py-8 transition-colors hover:bg-paper-2 lg:grid-cols-12 lg:items-baseline lg:gap-8"
    >
      <span
        aria-hidden="true"
        className="font-serif text-sm font-bold tabular-nums text-bronze lg:col-span-1"
      >
        {String(index).padStart(2, "0")}
      </span>

      <div className="min-w-0 lg:col-span-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <BEyebrow>{resource.categoryLabel}</BEyebrow>
          <time
            dateTime={resource.publishedAtAttr}
            className="text-xs tracking-wide text-quiet"
          >
            {resource.publishedOn}
          </time>
        </div>
        <h3 className="mt-2 font-serif text-xl font-bold break-words text-ink group-hover:underline sm:text-2xl">
          {resource.title}
        </h3>
        {resource.summary && (
          <p className="mt-2 line-clamp-2 max-w-[62ch] text-sm leading-relaxed break-words text-ink/70">
            {resource.summary}
          </p>
        )}
      </div>

      <span className="text-xs tracking-wide text-quiet lg:col-span-3 lg:text-right">
        {fileCountLabel.replace("{count}", String(resource.attachmentCount))}
      </span>
    </Link>
  );
}
