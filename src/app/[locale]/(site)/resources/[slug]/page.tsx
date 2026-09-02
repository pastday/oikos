import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/page/Section";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { localePath } from "@/lib/navigation";
import { buildPageMetadata } from "@/lib/metadata";
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

  return buildPageMetadata({
    locale,
    path: `/resources/${post.slug}`,
    title: post.title,
    description: post.summary ?? undefined,
  });
}

/**
 * 자료실 상세. (A안)
 * 공개되지 않았거나 없는 slug 면 404. 본문은 여러 문단의 평문이며 HTML 로 해석하지 않는다.
 */
export default async function ResourceDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const post = await getPublishedResourcePost(slug, locale);
  if (!post) notFound();

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_80%_0%,rgba(163,125,61,0.24),transparent_65%)]"
        />
        <Container className="relative py-14 lg:py-20">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-semibold tracking-wide text-gold-soft">
              {post.categoryLabel}
            </span>
            <time dateTime={post.publishedAtAttr} className="text-white/70">
              {post.publishedOn}
            </time>
          </div>
          <h1 className="mt-4 max-w-3xl font-serif text-3xl font-bold text-balance lg:text-4xl">
            {post.title}
          </h1>
        </Container>
      </section>

      <Section>
        <article className="mx-auto max-w-3xl">
          {post.paragraphs.length > 0 && (
            <div className="space-y-5">
              {post.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-[0.9375rem] leading-[1.85] break-words text-foreground/85"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {post.attachments.length > 0 && (
            <div
              className={post.paragraphs.length > 0 ? "mt-12" : undefined}
            >
              <h2 className="text-sm font-bold tracking-[0.08em] text-navy">
                {dict.resources.attachmentsTitle}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {post.attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <a
                      href={attachment.downloadUrl}
                      download={attachment.name}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-line bg-background px-4 py-3 text-sm transition-colors hover:border-navy"
                    >
                      <span
                        aria-hidden="true"
                        className="shrink-0 rounded border border-navy/40 px-1.5 py-0.5 text-[0.625rem] font-bold text-navy"
                      >
                        {attachment.ext}
                      </span>
                      <span className="min-w-0 flex-1 break-words font-semibold text-navy">
                        {attachment.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        {formatAttachmentSize(attachment.size)}
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-navy">
                        {dict.resources.downloadLabel}
                        <span aria-hidden="true"> ↓</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12 border-t border-line pt-8">
            <Link
              href={localePath(locale, "/resources")}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy underline-offset-4 hover:underline"
            >
              <span aria-hidden="true">←</span>
              {dict.resources.backToList}
            </Link>
          </div>
        </article>
      </Section>
    </>
  );
}
