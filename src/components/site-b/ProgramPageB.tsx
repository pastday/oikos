import type { ProgramPageContent } from "@/content/pages";
import type { ProgramCurriculum } from "@/lib/cms/types";
import { ContainerB } from "./ContainerB";
import { CourseListB } from "./CourseListB";
import { PageHeroB } from "./PageHeroB";
import { FactGridB, ProseB, SectionB, SectionHeadB } from "./SectionB";

/**
 * MBA · DBA 상세 페이지 본문 (B안).
 *
 * A안과 마찬가지로 두 과정의 구성이 같아 한 컴포넌트를 쓰고 문구와 교육과정만 주입한다.
 * **데이터는 전부 DB 에서 온 것**이고 이 파일은 조판만 한다.
 * 학점·학기·과목을 여기서 계산하거나 새로 적지 않는다. (13단계 지시 18·19항)
 *
 * DBA 는 `modules`(교육과정 체계)가 있고 MBA 는 없다. 없으면 그 섹션을 그리지 않는다.
 */
export function ProgramPageB({
  content,
  curriculum,
}: {
  content: ProgramPageContent;
  curriculum: ProgramCurriculum;
}) {
  const labels = content.curriculum;
  const { additionalMajor, common } = curriculum;

  return (
    <>
      <PageHeroB intro={content.intro} />

      <SectionB>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeadB index={1} title={content.overview.title} />
            </div>
          </div>
          <div className="lg:col-span-7">
            <ProseB paragraphs={content.overview.paragraphs} />
          </div>
        </div>
      </SectionB>

      <SectionB tone="ink">
        <SectionHeadB index={2} title={content.summary.title} tone="dark" />
        <div className="mt-14">
          <FactGridB items={content.summary.items} columns={3} tone="dark" />
        </div>
      </SectionB>

      <SectionB tone="paper-2">
        <SectionHeadB index={3} title={content.features.title} />
        <ul className="mt-14 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {content.features.items.map((feature, index) => (
            <li key={feature.title} className="bg-paper px-7 py-10">
              <span className="font-serif text-sm font-bold tracking-[0.1em] text-bronze">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-serif text-xl font-bold text-ink">
                {feature.title}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-[1.9] text-quiet">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </SectionB>

      {content.modules && (
        <SectionB>
          <SectionHeadB
            index={4}
            title={content.modules.title}
            description={content.modules.description}
          />

          <ol className="mt-14 grid gap-px bg-rule lg:grid-cols-5">
            {content.modules.items.map((module, index) => (
              <li key={module.name} className="flex flex-col bg-paper px-6 py-8">
                <span className="font-serif text-sm font-bold tracking-[0.1em] text-bronze">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-serif text-lg font-bold text-ink">
                  {module.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-quiet">
                  {module.summary}
                </p>
                <ul className="mt-6 space-y-2 border-t border-rule pt-5 text-xs leading-relaxed text-ink/70">
                  {module.details.map((detail) => (
                    <li key={detail} className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-px w-2.5 shrink-0 bg-bronze"
                      />
                      {detail}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </SectionB>
      )}

      {/* 교육과정. 항목이 많아 지면 폭을 좁혀 읽기 쉽게 둔다. */}
      <section className="bg-paper-2 py-20 lg:py-32">
        <ContainerB>
          <SectionHeadB
            index={content.modules ? 5 : 4}
            title={labels.title}
            description={labels.description}
          />

          <div className="mt-14 space-y-16">
            <div>
              <h3 className="font-serif text-2xl font-bold text-ink">
                {labels.majorTitle}
              </h3>

              <div className="mt-8 space-y-12">
                {curriculum.bySemester.map((group) => (
                  <div key={group.semester}>
                    <h4 className="text-[0.6875rem] font-semibold tracking-[0.2em] text-bronze uppercase">
                      {labels.semesterLabelTemplate.replace(
                        "{n}",
                        String(group.semester),
                      )}
                    </h4>
                    <div className="mt-5">
                      <CourseListB
                        courses={group.courses}
                        labels={labels}
                        idPrefix={`s${group.semester}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {additionalMajor.length > 0 && (
              <div>
                <h3 className="font-serif text-2xl font-bold text-ink">
                  {labels.additionalTitle}
                </h3>
                <p className="mt-3 text-sm text-quiet">{labels.additionalNote}</p>
                <div className="mt-6">
                  <CourseListB
                    courses={additionalMajor}
                    labels={labels}
                    idPrefix="add"
                  />
                </div>
              </div>
            )}

            {common.length > 0 && (
              <div>
                <h3 className="font-serif text-2xl font-bold text-ink">
                  {labels.commonTitle}
                </h3>
                <div className="mt-6">
                  <CourseListB
                    courses={common}
                    labels={labels}
                    idPrefix="common"
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-quiet">{labels.note}</p>
          </div>
        </ContainerB>
      </section>

      <SectionB>
        <SectionHeadB
          index={content.modules ? 6 : 5}
          title={content.graduation.title}
        />
        <div className="mt-14">
          <FactGridB items={content.graduation.items} columns={4} />
        </div>
        {content.graduation.note && (
          <p className="mt-8 text-sm text-quiet">{content.graduation.note}</p>
        )}
      </SectionB>
    </>
  );
}
