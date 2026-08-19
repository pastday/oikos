import type { ProgramPageContent } from "@/content/pages";
import type { ProgramCurriculum } from "@/lib/cms/types";
import { BRowList, BStatsBand, type BRow } from "./BBlocks";
import { BCourseList } from "./BCourseList";
import { BContainer, BSection } from "./BLayout";
import { designBImages } from "./images";
import { BPageHero } from "./BPageHero";
import {
  BBody,
  BEyebrow,
  BHeadline,
  BPullQuote,
  BRule,
} from "./BType";

/**
 * MBA · DBA 상세 페이지 본문 (B안).
 *
 * ## A안과 무엇이 다른가
 *
 * A안은 같은 모양의 `Section` 이 여섯 번 이어진다.
 * 개요 → 요약표 → 특징 카드 → (모듈 카드) → 교과목 아코디언 → 졸업요건 표.
 * 전부 "제목 + 상자"라 어디가 중요한지 알 수 없다.
 *
 * B안은 순서를 바꾸고 성격을 다르게 둔다.
 *
 *   1. Hero 바로 아래에 **수치 띠**를 붙여 학기·학점이 가장 먼저 읽히게 한다.
 *   2. 개요는 첫 문단을 크게 세운 선언문 + 2단 본문.
 *   3. 특징과 교육과정 체계는 카드가 아니라 번호가 붙은 가로선 목록.
 *   4. 교과목은 왼쪽에 제목이 머무는 2단 배치 안의 전폭 목록.
 *   5. 졸업요건은 상자 없는 수치 띠로 닫는다.
 *
 * 데이터는 전부 DB 에서 온 것이고 이 파일은 조판만 한다.
 * 학점·학기·과목을 여기서 계산하거나 새로 적지 않는다.
 */
export function BProgramPage({
  content,
  curriculum,
  index,
  watermark,
}: {
  content: ProgramPageContent;
  curriculum: ProgramCurriculum;
  index: number;
  watermark: string;
}) {
  const labels = content.curriculum;
  const { additionalMajor, common } = curriculum;
  const [overviewLead, ...overviewRest] = content.overview.paragraphs;

  const featureRows: BRow[] = content.features.items.map((feature) => ({
    id: feature.title,
    title: feature.title,
    body: feature.description,
  }));

  return (
    <>
      {/* 상단 비주얼은 MBA·DBA 가 같은 것을 쓴다. 형제 페이지라 인상을 맞춘다. */}
      <BPageHero
        intro={content.intro}
        index={index}
        staticSrc={designBImages.programs}
        watermark={watermark}
      />

      {/* 수치를 Hero 바로 아래에 붙인다. 이 페이지에서 가장 먼저 읽혀야 할 정보다. */}
      <section className="bg-ink text-white">
        <BContainer>
          <BStatsBand
            stats={content.summary.items.map((item) => ({
              label: item.label,
              value: item.value,
              note: item.note ?? null,
            }))}
            tone="dark"
            columns={4}
          />
        </BContainer>
      </section>

      <BSection index={1} label={content.overview.title} tone="paper">
        <BHeadline size="small">{content.overview.title}</BHeadline>
        {overviewLead && (
          <BPullQuote className="mt-8">{overviewLead}</BPullQuote>
        )}
        <BRule className="my-12 lg:my-14" />
        <BBody paragraphs={overviewRest} columns={2} />
      </BSection>

      <BSection index={2} label={content.features.title} tone="stone">
        <BHeadline>{content.features.title}</BHeadline>
        <div className="mt-12">
          <BRowList rows={featureRows} size="large" />
        </div>
      </BSection>

      {content.modules && (
        <BSection index={3} label={content.modules.title} tone="ink">
          <BHeadline tone="dark">{content.modules.title}</BHeadline>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-[1.85] text-white/70">
            {content.modules.description}
          </p>

          <ol className="mt-12 border-t border-white/15">
            {content.modules.items.map((module, moduleIndex) => (
              <li key={module.name} className="border-b border-white/15">
                <div className="grid gap-6 py-8 lg:grid-cols-12 lg:gap-10">
                  <div className="flex items-baseline gap-5 lg:col-span-5">
                    <span
                      aria-hidden="true"
                      className="font-serif text-sm font-bold tabular-nums text-bronze-2"
                    >
                      {String(moduleIndex + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-white">
                        {module.name}
                      </h3>
                      <p className="mt-3 max-w-md text-sm leading-[1.85] text-white/60">
                        {module.summary}
                      </p>
                    </div>
                  </div>

                  <ul className="lg:col-span-7">
                    {module.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex gap-3 border-b border-white/10 py-2.5 text-sm text-white/75 last:border-0"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2.5 h-px w-3 shrink-0 bg-bronze-2"
                        />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </BSection>
      )}

      <BSection
        index={content.modules ? 4 : 3}
        label={labels.title}
        tone="paper"
      >
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <BHeadline>{labels.title}</BHeadline>
              <p className="mt-6 max-w-md text-[0.9375rem] leading-[1.85] text-quiet">
                {labels.description}
              </p>
              <p className="mt-8 text-xs leading-relaxed text-quiet">
                {labels.note}
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <BEyebrow>{labels.majorTitle}</BEyebrow>

            <div className="mt-8 space-y-12">
              {curriculum.bySemester.map((group) => (
                <div key={group.semester}>
                  <p className="text-[0.625rem] font-semibold tracking-[0.22em] text-quiet uppercase">
                    {labels.semesterLabelTemplate.replace(
                      "{n}",
                      String(group.semester),
                    )}
                  </p>
                  <div className="mt-4">
                    <BCourseList
                      courses={group.courses}
                      labels={labels}
                      idPrefix={`s${group.semester}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {additionalMajor.length > 0 && (
              <div className="mt-16">
                <BEyebrow>{labels.additionalTitle}</BEyebrow>
                <p className="mt-4 text-sm text-quiet">{labels.additionalNote}</p>
                <div className="mt-5">
                  <BCourseList
                    courses={additionalMajor}
                    labels={labels}
                    idPrefix="add"
                  />
                </div>
              </div>
            )}

            {common.length > 0 && (
              <div className="mt-16">
                <BEyebrow>{labels.commonTitle}</BEyebrow>
                <div className="mt-5">
                  <BCourseList
                    courses={common}
                    labels={labels}
                    idPrefix="common"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </BSection>

      <BSection
        index={content.modules ? 5 : 4}
        label={content.graduation.title}
        tone="stone"
      >
        <BHeadline>{content.graduation.title}</BHeadline>

        <div className="mt-12 border-t border-rule-2/60">
          <BStatsBand
            stats={content.graduation.items.map((item) => ({
              label: item.label,
              value: item.value,
              note: item.note ?? null,
            }))}
            tone="light"
            columns={4}
          />
        </div>

        {content.graduation.note && (
          <p className="mt-10 max-w-[62ch] text-sm leading-relaxed text-quiet">
            {content.graduation.note}
          </p>
        )}
      </BSection>
    </>
  );
}
