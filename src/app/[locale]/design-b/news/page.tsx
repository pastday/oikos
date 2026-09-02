import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BFrame } from "@/components/site-b/BFrame";
import { BSection } from "@/components/site-b/BLayout";
import { BPageHero } from "@/components/site-b/BPageHero";
import { BEyebrow, BHeadline, BLead } from "@/components/site-b/BType";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { getDictionary } from "@/i18n";
import { isLocale, type Locale } from "@/i18n/config";
import { bPath } from "@/components/site-b/paths";
import { getPublishedNewsList, type NewsListItem } from "@/lib/cms/news";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);

  return buildDesignBMetadata({
    title: dict.news.title,
    description: dict.news.description,
  });
}

/**
 * 학교소식 목록. (B안)
 *
 * 데이터·조회·공개 규칙은 A안과 **똑같은 코드**(`getPublishedNewsList`)를 쓴다.
 * 갈라지는 것은 조판뿐이다. A안은 3열 카드 그리드, B안은 번호가 붙은 가로선 목록이다.
 */
export default async function DesignBNewsListPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const posts = await getPublishedNewsList(locale);
  const watermark = dict.site.wordmark;

  return (
    <>
      <BPageHero
        intro={{
          eyebrow: dict.site.wordmark,
          title: dict.news.title,
          description: dict.news.description,
        }}
        index={3}
        watermark={watermark}
      />

      <BSection index={1} label={dict.news.title} tone="paper">
        <BHeadline>{dict.news.title}</BHeadline>
        <BLead className="mt-6 max-w-2xl">{dict.news.description}</BLead>

        {posts.length === 0 ? (
          <p className="mt-14 border-l-2 border-rule-2 py-1 pl-6 text-sm text-quiet">
            {dict.news.empty}
          </p>
        ) : (
          <ul className="mt-14 border-t border-rule-2/60">
            {posts.map((post, index) => (
              <li key={post.id} className="border-b border-rule-2/60">
                <BNewsRow post={post} locale={locale} index={index + 1} />
              </li>
            ))}
          </ul>
        )}
      </BSection>
    </>
  );
}

function BNewsRow({
  post,
  locale,
  index,
}: {
  post: NewsListItem;
  locale: Locale;
  index: number;
}) {
  return (
    <Link
      href={bPath(locale, `/news/${post.slug}`)}
      className="group grid gap-5 py-8 transition-colors hover:bg-paper-2 sm:grid-cols-[10rem_1fr] sm:gap-8 lg:grid-cols-[14rem_1fr]"
    >
      {post.cover ? (
        <BFrame media={post.cover} ratio="3/2" />
      ) : (
        <BFrame ratio="3/2" watermark={index.toString().padStart(2, "0")} />
      )}

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <BEyebrow>{post.categoryLabel}</BEyebrow>
          <time
            dateTime={post.publishedAtAttr}
            className="text-xs tracking-wide text-quiet"
          >
            {post.publishedOn}
          </time>
        </div>

        <h3 className="font-serif text-xl font-bold break-words text-ink group-hover:underline sm:text-2xl">
          {post.title}
        </h3>

        {post.summary && (
          <p className="line-clamp-3 max-w-[62ch] text-sm leading-relaxed break-words text-ink/70">
            {post.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
