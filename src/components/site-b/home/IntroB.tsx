import type { HomeContent } from "@/content/home";
import { ContainerB } from "../ContainerB";
import { ProseB, PullQuoteB, SectionHeadB } from "../SectionB";

/**
 * 대학원 · 전공 소개.
 *
 * 문구는 A안 메인과 **같은 콘텐츠**를 쓴다. 의미를 바꾸거나 줄이지 않는다.
 * 조판만 다르다. 제목을 왼쪽에 붙여 두고(스크롤해도 잠시 머문다) 본문을 오른쪽에 흘려
 * 학술지 지면 같은 비대칭 구성을 만든다.
 */
export function IntroB({ content }: { content: HomeContent }) {
  const { major } = content;

  return (
    <section className="border-b border-rule bg-paper py-20 lg:py-32">
      <ContainerB>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeadB
                index={1}
                eyebrow={major.eyebrow}
                title={major.title}
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <ProseB paragraphs={major.paragraphs} />
            <div className="mt-10">
              <PullQuoteB>{major.ficbNote}</PullQuoteB>
            </div>
          </div>
        </div>
      </ContainerB>
    </section>
  );
}
