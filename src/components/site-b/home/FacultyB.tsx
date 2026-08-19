import Image from "next/image";
import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import type { FacultyView } from "@/lib/cms/types";
import { ContainerB } from "../ContainerB";
import { bPath } from "../paths";
import { ButtonB, SectionHeadB } from "../SectionB";

/**
 * 주임교수 소개.
 *
 * 교수 정보는 DB(`Faculty`)에서 오고 사진은 `Media` 관계에서 온다.
 * **사진이 없으면 이니셜을 쓴다.** 실존하지 않는 인물 사진을 만들거나
 * 인터넷 사진을 가져다 쓰지 않는다. (13단계 지시 18항)
 *
 * B안에서는 이니셜 자리를 작은 원이 아니라 **큰 사각 판**으로 둔다.
 * 사진이 없는 상태에서도 지면이 비어 보이지 않고, 나중에 사진이 들어오면
 * 같은 자리에 인물 사진이 그대로 들어간다.
 *
 * 공개된 주임교수가 없으면 이 섹션을 그리지 않는다. (A안과 같은 규칙)
 */
export function FacultyB({
  locale,
  content,
  chief,
}: {
  locale: Locale;
  content: HomeContent;
  chief: FacultyView | null;
}) {
  const { faculty } = content;

  if (!chief) return null;

  return (
    <section className="border-b border-rule bg-paper py-20 lg:py-32">
      <ContainerB>
        <SectionHeadB
          index={5}
          eyebrow={faculty.eyebrow}
          title={faculty.title}
          description={faculty.description}
        />

        <div className="mt-16 grid gap-px bg-rule lg:grid-cols-12">
          <div className="relative bg-ink lg:col-span-4">
            {chief.photo ? (
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={chief.photo.url}
                  alt={chief.photo.alt}
                  fill
                  sizes="(min-width: 1024px) 24rem, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                aria-hidden="true"
                className="flex aspect-[4/5] w-full items-center justify-center bg-[radial-gradient(ellipse_70%_70%_at_50%_20%,rgba(168,130,63,0.25),transparent_65%)]"
              >
                <span className="font-serif text-6xl font-bold tracking-[0.1em] text-bronze-2/80">
                  {chief.initials}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center bg-paper-2 px-8 py-12 lg:col-span-8 lg:px-14 lg:py-16">
            <h3 className="font-serif text-4xl font-bold text-ink lg:text-5xl">
              {chief.name}
            </h3>
            {chief.nameAlt && (
              <p className="mt-3 text-sm tracking-[0.1em] text-quiet uppercase">
                {chief.nameAlt}
              </p>
            )}

            {chief.title && (
              <p className="mt-8 border-t border-rule pt-8 text-[0.6875rem] font-semibold tracking-[0.2em] text-bronze uppercase">
                {chief.title}
              </p>
            )}

            {chief.major && (
              <p className="mt-4 text-[1.0625rem] leading-[1.9] text-ink/75">
                {chief.major}
              </p>
            )}

            <div className="mt-10">
              <ButtonB href={bPath(locale, "/faculty")} variant="outline">
                {faculty.cta}
              </ButtonB>
            </div>
          </div>
        </div>
      </ContainerB>
    </section>
  );
}
