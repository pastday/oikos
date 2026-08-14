import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";

const PAGE_KEY = "consultation" as const;
const PAGE_PATH = "/consultation";

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
    title: dict.pages[PAGE_KEY].title,
  });
}

export default async function ConsultationPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const page = dict.pages[PAGE_KEY];

  return (
    <PagePlaceholder
      title={page.title}
      placeholder={page.placeholder}
      devNotice={dict.devNotice}
    />
  );
}
