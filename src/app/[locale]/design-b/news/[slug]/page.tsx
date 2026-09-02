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
  getPublishedNewsPost,
} from "@/lib/cms/news";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const post = await getPublishedNewsPost(slug, locale);
  if (!post) return {};

  return buildDesignBMetadata({
    title: post.title,
    description: post.summary ?? undefined,
  });
}

/**
 * 학교소식 상세. (B안)
 *
 * A안과 같은 조회(`getPublishedNewsPost`)를 쓴다. 공개되지 않았거나 없는 slug 면 404.
 * 대표 이미지는 Hero 배경으로 올린다. (B안 상세의 공통 규칙 — `BPageHero`)
 */
export default async function DesignBNewsDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const post = await getPublishedNewsPost(slug, locale);
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
        media={post.cover}
        watermark={dict.site.wordmark}
      />

      <BSection index={1} label={dict.news.title} tone="paper">
        <div className="max-w-[72ch]">
          <BBody paragraphs={post.paragraphs} />

          {post.attachments.length > 0 && (
            <div className="mt-14 border-t border-rule-2 pt-8">
              <BEyebrow>{dict.news.attachmentsTitle}</BEyebrow>
              <ul className="mt-5 flex flex-col">
                {post.attachments.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="border-b border-rule-2/60 first:border-t"
                  >
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-baseline gap-4 py-4"
                    >
                      <span
                        aria-hidden="true"
                        className="text-[0.625rem] font-bold tracking-[0.2em] text-bronze"
                      >
                        FILE
                      </span>
                      <span className="min-w-0 flex-1 truncate font-serif text-lg font-bold text-ink group-hover:underline">
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
                        {dict.news.downloadLabel} ({dict.news.newWindow})
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-14 border-t border-rule-2 pt-8">
            <Link
              href={bPath(locale, "/news")}
              className="inline-flex items-center gap-2 font-serif text-lg font-bold text-ink hover:underline"
            >
              <span aria-hidden="true">←</span>
              {dict.news.backToList}
            </Link>
          </div>
        </div>
      </BSection>
    </>
  );
}
