import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/page/Section";
import { getDictionary } from "@/i18n";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/lib/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import { getPublishedNewsList, type NewsListItem } from "@/lib/cms/news";

const PAGE_PATH = "/news";

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
    title: dict.news.title,
    description: dict.news.description,
  });
}

/**
 * 학교소식 목록. (A안)
 *
 * 게시물은 DB(`NewsPost`)에서 읽으며 최신 게시일이 먼저 온다.
 * 공개된 게시물이 없으면 안내 문구만 보여 준다. 페이지는 깨지지 않는다.
 * 교수 개인의 언론보도(`FacultyArticle`)와는 무관한 별도 기능이다.
 */
export default async function NewsListPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const posts = await getPublishedNewsList(locale);

  return (
    <>
      <PageHero
        intro={{
          eyebrow: dict.site.wordmark,
          title: dict.news.title,
          description: dict.news.description,
        }}
      />

      <Section>
        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center">
            <p className="text-sm text-muted">{dict.news.empty}</p>
          </div>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {posts.map((post) => (
              <li key={post.id} className="min-w-0">
                <NewsCard post={post} locale={locale} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

/** 목록 카드 하나. 대표 이미지가 없으면 이미지 영역을 생략한다. (지시 13항) */
function NewsCard({
  post,
  locale,
}: {
  post: NewsListItem;
  locale: Locale;
}) {
  return (
    <Link
      href={localePath(locale, `/news/${post.slug}`)}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-background transition-colors hover:border-navy/40"
    >
      {post.cover && (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface">
          <Image
            src={post.cover.url}
            alt={post.cover.alt}
            fill
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          <span className="rounded-full bg-navy-tint px-2.5 py-0.5 font-semibold text-navy">
            {post.categoryLabel}
          </span>
          <time dateTime={post.publishedAtAttr} className="text-muted">
            {post.publishedOn}
          </time>
        </div>

        <h2 className="font-serif text-lg leading-snug font-bold break-words text-navy group-hover:underline">
          {post.title}
        </h2>

        {post.summary && (
          <p className="line-clamp-3 text-sm leading-relaxed break-words text-foreground/75">
            {post.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
