import { Container } from "@/components/layout/Container";
import type { HomeContent } from "@/content/home";
import type { Pillar } from "@/content/home/types";
import { SectionHeading } from "./SectionHeading";

/**
 * 전공 소개 + 네 가지 핵심 영역.
 * 원본 전공 소개 문서의 핵심 의미를 보존하되 웹에서 읽기 쉬운 길이로 요약한 내용을 사용한다.
 * 아이콘은 라이브러리를 추가하지 않고 간단한 SVG 로 직접 구성한다. (지시 10항)
 */
function PillarIcon({ variant }: { variant: Pillar["key"] }) {
  const common = {
    className: "h-6 w-6",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (variant) {
    case "hotel":
      return (
        <svg {...common}>
          <path d="M3 21h18M5 21V6l7-3 7 3v15" />
          <path d="M9 10h2M13 10h2M9 14h2M13 14h2M11 21v-3h2v3" />
        </svg>
      );
    case "foodservice":
      return (
        <svg {...common}>
          <path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10" />
          <path d="M17 3c-1.5 1.5-2 3.5-2 5.5 0 1.5.7 2.5 2 2.5V3zM17 11v10" />
        </svg>
      );
    case "wine":
      return (
        <svg {...common}>
          <path d="M7 3h10l-.7 6a4.3 4.3 0 0 1-8.6 0L7 3z" />
          <path d="M12 13.5V20M8.5 20h7" />
        </svg>
      );
    case "tourism":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
        </svg>
      );
  }
}

export function MajorIntro({ content }: { content: HomeContent }) {
  const { major, pillars } = content;

  return (
    <section className="border-b border-line bg-background py-16 lg:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow={major.eyebrow} title={major.title} />
          </div>

          <div className="lg:col-span-7">
            <div className="space-y-5">
              {major.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className="text-[0.9375rem] leading-[1.85] text-foreground/80"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <p className="mt-7 rounded-md border-l-2 border-gold bg-beige px-5 py-4 text-sm leading-relaxed text-navy">
              {major.ficbNote}
            </p>
          </div>
        </div>

        <div className="mt-16 lg:mt-20">
          <SectionHeading
            title={pillars.title}
            description={pillars.description}
            align="center"
          />

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.items.map((pillar) => (
              <li
                key={pillar.key}
                className="rounded-lg border border-line bg-surface p-6 transition-colors hover:border-gold/50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-navy-tint text-navy">
                  <PillarIcon variant={pillar.key} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-navy">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {pillar.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
