import type { ProgramPageContent } from "@/content/pages";
import type { ProgramCurriculum } from "@/lib/cms/types";
import { CourseList } from "./CourseList";
import { PageHero } from "./PageHero";
import { FactGrid, Prose, Section } from "./Section";

/**
 * MBA / DBA 상세 페이지 본문.
 * 두 과정의 구성이 같아 한 컴포넌트로 두고 문구와 교육과정만 주입한다.
 *
 * 교육과정(`curriculum`)은 DB 의 `Course` 에서 읽어 온 것이다.
 * 학기차가 지정되지 않은 과목은 "그 밖의 전공과목" 으로 따로 묶여 들어온다.
 */
export function ProgramPage({
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
      <PageHero intro={content.intro} />

      <Section title={content.overview.title}>
        <Prose paragraphs={content.overview.paragraphs} />
      </Section>

      <Section title={content.summary.title} tone="surface">
        <FactGrid items={content.summary.items} />
      </Section>

      <Section title={content.features.title}>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.features.items.map((feature) => (
            <li
              key={feature.title}
              className="rounded-lg border border-line bg-surface p-6"
            >
              <h3 className="text-base font-semibold text-navy">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {content.modules && (
        <Section
          title={content.modules.title}
          description={content.modules.description}
          tone="surface"
        >
          <ol className="grid gap-4 lg:grid-cols-5">
            {content.modules.items.map((module, index) => (
              <li
                key={module.name}
                className="flex flex-col rounded-lg border border-line bg-background p-5"
              >
                <span className="font-serif text-sm font-bold text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-base font-semibold text-navy">
                  {module.name}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {module.summary}
                </p>
                <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-xs text-foreground/75">
                  {module.details.map((detail) => (
                    <li key={detail} className="flex gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold"
                      />
                      {detail}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <Section title={labels.title} description={labels.description}>
        <div className="space-y-10">
          <div>
            <h3 className="text-lg font-semibold text-navy">
              {labels.majorTitle}
            </h3>

            <div className="mt-5 space-y-6">
              {curriculum.bySemester.map((group) => (
                <div key={group.semester}>
                  <h4 className="mb-3 inline-block rounded-full bg-navy-tint px-3.5 py-1.5 text-xs font-semibold text-navy">
                    {labels.semesterLabelTemplate.replace(
                      "{n}",
                      String(group.semester),
                    )}
                  </h4>
                  <CourseList
                    courses={group.courses}
                    labels={labels}
                    idPrefix={`s${group.semester}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {additionalMajor.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-navy">
                {labels.additionalTitle}
              </h3>
              <p className="mt-2 text-sm text-muted">{labels.additionalNote}</p>
              <div className="mt-4">
                <CourseList
                  courses={additionalMajor}
                  labels={labels}
                  idPrefix="add"
                />
              </div>
            </div>
          )}

          {common.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-navy">
                {labels.commonTitle}
              </h3>
              <div className="mt-4">
                <CourseList courses={common} labels={labels} idPrefix="common" />
              </div>
            </div>
          )}

          <p className="text-xs text-muted">{labels.note}</p>
        </div>
      </Section>

      <Section title={content.graduation.title} tone="surface">
        <FactGrid items={content.graduation.items} columns={4} />
        {content.graduation.note && (
          <p className="mt-5 text-sm text-muted">{content.graduation.note}</p>
        )}
      </Section>
    </>
  );
}
