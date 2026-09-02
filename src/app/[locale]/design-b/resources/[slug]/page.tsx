import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BSection } from "@/components/site-b/BLayout";
import { BPageHero } from "@/components/site-b/BPageHero";
import { BBody, BEyebrow } from "@/components/site-b/BType";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { bPath } from "@/components/site-b/paths";
import {
  formatAttachmentSize,
  getPublishedResourcePost,
} from "@/lib/cms/resources";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const post = await getPublishedResourcePost(slug, locale);
  if (!post) return {};

  return buildDesignBMetadata({
    title: post.title,
    description: post.summary ?? undefined,
  });
}

/** 자료실 상세. (B안) A안과 같은 조회(`getPublishedResourcePost`). */
export default async function DesignBResourceDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const post = await getPublishedResourcePost(slug, locale);
  if (!post) notFound();

  return (
    <>
      <BPageHero
        intro={{
          eyebrow: `${post.categoryLabel} · ${post.publishedOn}`,
          title: post.title,
          description: post.summary ?? "",
        }}
        index={3}
        watermark={dict.site.wordmark}
      />

      <BSection index={1} label={dict.resources.title} tone="paper">
        <div className="max-w-[72ch]">
          <BBody paragraphs={post.paragraphs} />

          {post.attachments.length > 0 && (
            <div
              className={post.paragraphs.length > 0 ? "mt-14" : undefined}
            >
              <BEyebrow>{dict.resources.attachmentsTitle}</BEyebrow>
              <ul className="mt-5 flex flex-col">
                {post.attachments.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="border-b border-rule-2/60 first:border-t"
                  >
                    <a
                      href={attachment.downloadUrl}
                      download={attachment.name}
                      className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4"
                    >
                      <span
                        aria-hidden="true"
                        className="text-[0.625rem] font-bold tracking-[0.2em] text-bronze"
                      >
                        {attachment.ext}
                      </span>
                      <span className="min-w-0 flex-1 break-words font-serif text-lg font-bold text-ink group-hover:underline">
                        {attachment.name}
                      </span>
                      <span className="shrink-0 text-xs text-quiet">
                        {formatAttachmentSize(attachment.size)}
                      </span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-ink transition-transform group-hover:translate-x-1"
                      >
                        ↓
                      </span>
                      <span className="sr-only">
                        {dict.resources.downloadLabel}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-14 border-t border-rule-2 pt-8">
            <Link
              href={bPath(locale, "/resources")}
              className="inline-flex items-center gap-2 font-serif text-lg font-bold text-ink hover:underline"
            >
              <span aria-hidden="true">←</span>
              {dict.resources.backToList}
            </Link>
          </div>
        </div>
      </BSection>
    </>
  );
}
