import "dotenv/config";
import type { ProgramType } from "../src/generated/prisma/enums";
import { prisma } from "../src/lib/prisma";
import { getPageContent } from "../src/content/pages";
import type { PageContent } from "../src/content/pages";
import type { ProgramNumbers } from "../src/lib/cms/types";
import {
  dbaFacts,
  exchangeRateBase,
  fees,
  intake,
  mbaFacts,
} from "../src/content/program-facts";

/**
 * 정적 페이지 콘텐츠 → DB 일회성 이관 스크립트. (10단계)
 *
 *   npm run seed:pages
 *
 * 9단계의 `seed-cms-content.ts` 와 같은 성격이며, 같은 규칙을 따른다.
 *
 * ## 다시 실행해도 안전하다
 *
 * **이미 있으면 건드리지 않는다.** 관리자가 CMS 에서 고친 내용을 되돌리지 않기 위해서다.
 *
 *   PageSection     : (pageKey, sectionKey)  — 행이 있으면 통째로 건너뛴다
 *   PageSectionItem : 섹션에 항목이 하나라도 있으면 그 섹션의 항목을 건너뛴다
 *   FAQ             : questionKo
 *   SiteSetting     : key
 *
 * 항목을 행 단위 자연키로 맞추지 않는 이유가 있다. 관리자가 카드 문구를 고치면
 * 자연키가 달라져 seed 가 **원본 카드를 다시 만들어 중복**이 된다.
 * "이미 채워진 섹션은 건드리지 않는다" 가 더 안전하다.
 *
 * ## 원본 자료의 값을 그대로 옮긴다
 *
 * 문구를 다듬거나 빠진 값을 채우지 않는다. 원본에 없는 값(LMS 사용료)은 null 로 둔다.
 * (CLAUDE.md 23항)
 */

// ---------------------------------------------------------------------------

type Counts = { created: number; skipped: number };

function summarize(label: string, counts: Counts): void {
  console.log(
    `  ${label.padEnd(22)} 생성 ${counts.created}건 / 이미 있어 건너뜀 ${counts.skipped}건`,
  );
}

/** 문단 배열을 한 칸의 텍스트로 만든다. **빈 줄이 문단 구분자다.** */
function toBody(paragraphs: readonly string[]): string {
  return paragraphs.join("\n\n");
}

type ItemSeed = {
  labelKo: string | null;
  labelEn: string | null;
  valueKo: string | null;
  valueEn: string | null;
  variant: string | null;
};

type SectionSeed = {
  sectionKey: string;
  titleKo?: string | null;
  titleEn?: string | null;
  subtitleKo?: string | null;
  subtitleEn?: string | null;
  bodyKo?: string | null;
  bodyEn?: string | null;
  highlightKo?: string | null;
  highlightEn?: string | null;
  noteKo?: string | null;
  noteEn?: string | null;
  items?: ItemSeed[];
};

/**
 * 한국어·영어 목록을 index 로 맞춰 항목 seed 로 만든다.
 *
 * 두 콘텐츠는 같은 타입을 공유하므로 길이가 다를 수 없지만, 혹시 어긋나면
 * 영어를 null 로 두고 한국어만 넣는다. 없는 번역을 지어내지 않는다.
 */
function zipItems<Ko, En>(
  ko: readonly Ko[],
  en: readonly En[],
  map: (item: Ko | En) => { label: string | null; value: string | null; variant?: string | null },
): ItemSeed[] {
  return ko.map((item, index) => {
    const koValues = map(item);
    const enItem = en[index];
    const enValues = enItem ? map(enItem) : null;

    return {
      labelKo: koValues.label,
      labelEn: enValues?.label ?? null,
      valueKo: koValues.value,
      valueEn: enValues?.value ?? null,
      variant: koValues.variant ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// 페이지별 섹션 정의 — 현재 공개 페이지에 표시되는 값을 그대로 옮긴다
// ---------------------------------------------------------------------------

function aboutSections(ko: PageContent, en: PageContent): SectionSeed[] {
  const k = ko.about;
  const e = en.about;

  return [
    {
      sectionKey: "intro",
      subtitleKo: k.intro.eyebrow,
      subtitleEn: e.intro.eyebrow,
      titleKo: k.intro.title,
      titleEn: e.intro.title,
      bodyKo: k.intro.description,
      bodyEn: e.intro.description,
    },
    {
      sectionKey: "president",
      titleKo: k.presidentNotice.title,
      titleEn: e.presidentNotice.title,
      bodyKo: k.presidentNotice.body,
      bodyEn: e.presidentNotice.body,
    },
    {
      sectionKey: "school",
      titleKo: k.school.title,
      titleEn: e.school.title,
      bodyKo: toBody(k.school.paragraphs),
      bodyEn: toBody(e.school.paragraphs),
    },
    {
      sectionKey: "philosophy",
      titleKo: k.philosophy.title,
      titleEn: e.philosophy.title,
      bodyKo: toBody(k.philosophy.paragraphs),
      bodyEn: toBody(e.philosophy.paragraphs),
    },
    {
      sectionKey: "goals",
      titleKo: k.goals.title,
      titleEn: e.goals.title,
      items: zipItems(k.goals.items, e.goals.items, (item) => ({
        label: item.title,
        value: item.description,
      })),
    },
    {
      sectionKey: "university",
      titleKo: k.university.title,
      titleEn: e.university.title,
      bodyKo: toBody(k.university.paragraphs),
      bodyEn: toBody(e.university.paragraphs),
      items: zipItems(k.university.facts, e.university.facts, (item) => ({
        label: item.label,
        value: item.value,
      })),
    },
  ];
}

function degreeSections(ko: PageContent, en: PageContent): SectionSeed[] {
  const k = ko.degree;
  const e = en.degree;

  return [
    {
      sectionKey: "intro",
      subtitleKo: k.intro.eyebrow,
      subtitleEn: e.intro.eyebrow,
      titleKo: k.intro.title,
      titleEn: e.intro.title,
      bodyKo: k.intro.description,
      bodyEn: e.intro.description,
    },
    {
      sectionKey: "degrees",
      titleKo: k.degrees.title,
      titleEn: e.degrees.title,
      subtitleKo: k.degrees.description,
      subtitleEn: e.degrees.description,
    },
    {
      sectionKey: "foreign-doctorate",
      titleKo: k.foreignDoctorate.title,
      titleEn: e.foreignDoctorate.title,
      bodyKo: toBody(k.foreignDoctorate.paragraphs),
      bodyEn: toBody(e.foreignDoctorate.paragraphs),
      highlightKo: k.foreignDoctorate.highlight,
      highlightEn: e.foreignDoctorate.highlight,
      noteKo: k.foreignDoctorate.registrar,
      noteEn: e.foreignDoctorate.registrar,
    },
    {
      sectionKey: "accreditation",
      titleKo: k.accreditation.title,
      titleEn: e.accreditation.title,
      subtitleKo: k.accreditation.description,
      subtitleEn: e.accreditation.description,
      noteKo: k.accreditation.note,
      noteEn: e.accreditation.note,
      items: zipItems(k.accreditation.items, e.accreditation.items, (item) => ({
        label: item.name,
        value: item.body,
      })),
    },
    {
      sectionKey: "university",
      titleKo: k.university.title,
      titleEn: e.university.title,
      bodyKo: toBody(k.university.paragraphs),
      bodyEn: toBody(e.university.paragraphs),
    },
    {
      sectionKey: "faq-link",
      titleKo: k.faqLink.title,
      titleEn: e.faqLink.title,
      subtitleKo: k.faqLink.description,
      subtitleEn: e.faqLink.description,
      noteKo: k.faqLink.cta,
      noteEn: e.faqLink.cta,
    },
  ];
}

function admissionSections(ko: PageContent, en: PageContent): SectionSeed[] {
  const k = ko.admission;
  const e = en.admission;

  return [
    {
      sectionKey: "intro",
      subtitleKo: k.intro.eyebrow,
      subtitleEn: e.intro.eyebrow,
      titleKo: k.intro.title,
      titleEn: e.intro.title,
      bodyKo: k.intro.description,
      bodyEn: e.intro.description,
    },
    {
      sectionKey: "recruit",
      titleKo: k.recruit.title,
      titleEn: e.recruit.title,
      subtitleKo: k.recruit.description,
      subtitleEn: e.recruit.description,
      items: zipItems(k.recruit.items, e.recruit.items, (item) => ({
        label: item.label,
        value: item.value,
      })),
    },
    {
      sectionKey: "eligibility",
      titleKo: k.eligibility.title,
      titleEn: e.eligibility.title,
      bodyKo: toBody(k.eligibility.paragraphs),
      bodyEn: toBody(e.eligibility.paragraphs),
      noteKo: k.eligibility.note,
      noteEn: e.eligibility.note,
    },
    {
      sectionKey: "tuition",
      titleKo: k.tuition.title,
      titleEn: e.tuition.title,
      subtitleKo: k.tuition.description,
      subtitleEn: e.tuition.description,
      // 비고는 label 을 쓰지 않는 목록이다. 표의 금액은 SiteSetting 으로 따로 옮긴다.
      items: zipItems(k.tuition.notes, e.tuition.notes, (note) => ({
        label: null,
        value: typeof note === "string" ? note : null,
      })),
    },
    {
      sectionKey: "steps",
      titleKo: k.steps.title,
      titleEn: e.steps.title,
      subtitleKo: k.steps.description,
      subtitleEn: e.steps.description,
      items: zipItems(k.steps.items, e.steps.items, (item) => ({
        label: item.title,
        value: item.description,
      })),
    },
    {
      sectionKey: "calendar",
      titleKo: k.calendar.title,
      titleEn: e.calendar.title,
      subtitleKo: k.calendar.description,
      subtitleEn: e.calendar.description,
      items: zipItems(k.calendar.items, e.calendar.items, (item) => ({
        label: item.label,
        value: item.period,
        variant: item.type,
      })),
    },
  ];
}

function faqSections(ko: PageContent, en: PageContent): SectionSeed[] {
  return [
    {
      sectionKey: "intro",
      subtitleKo: ko.faq.intro.eyebrow,
      subtitleEn: en.faq.intro.eyebrow,
      titleKo: ko.faq.intro.title,
      titleEn: en.faq.intro.title,
      bodyKo: ko.faq.intro.description,
      bodyEn: en.faq.intro.description,
      noteKo: ko.faq.note,
      noteEn: en.faq.note,
    },
  ];
}

// ---------------------------------------------------------------------------

async function seedSections(
  pageKey: string,
  sections: SectionSeed[],
): Promise<{ sections: Counts; items: Counts }> {
  const sectionCounts: Counts = { created: 0, skipped: 0 };
  const itemCounts: Counts = { created: 0, skipped: 0 };

  for (const [index, seed] of sections.entries()) {
    const { items, sectionKey, ...slots } = seed;

    let section = await prisma.pageSection.findUnique({
      where: { pageKey_sectionKey: { pageKey, sectionKey } },
      select: { id: true, _count: { select: { items: true } } },
    });

    if (section) {
      sectionCounts.skipped += 1;
    } else {
      const created = await prisma.pageSection.create({
        data: { pageKey, sectionKey, ...slots, sortOrder: index },
        select: { id: true, _count: { select: { items: true } } },
      });
      section = created;
      sectionCounts.created += 1;
    }

    if (!items || items.length === 0) continue;

    // 이미 항목이 있으면 손대지 않는다. 관리자가 정리한 목록을 되돌리지 않기 위해서다.
    if (section._count.items > 0) {
      itemCounts.skipped += items.length;
      continue;
    }

    await prisma.pageSectionItem.createMany({
      data: items.map((item, itemIndex) => ({
        sectionId: section.id,
        ...item,
        sortOrder: itemIndex,
      })),
    });

    itemCounts.created += items.length;
  }

  return { sections: sectionCounts, items: itemCounts };
}

async function seedFaqs(content: PageContent, en: PageContent): Promise<Counts> {
  const counts: Counts = { created: 0, skipped: 0 };

  for (const [index, item] of content.faq.items.entries()) {
    const existing = await prisma.fAQ.findFirst({
      where: { questionKo: item.question },
      select: { id: true },
    });

    if (existing) {
      counts.skipped += 1;
      continue;
    }

    const english = en.faq.items[index];

    await prisma.fAQ.create({
      data: {
        questionKo: item.question,
        questionEn: english?.question ?? null,
        answerKo: item.answer,
        answerEn: english?.answer ?? null,
        sortOrder: index,
        isPublished: true,
      },
    });

    counts.created += 1;
  }

  return counts;
}

/**
 * 입학안내 수치.
 *
 * `fee.lms` 는 원본 표에 금액이 "-" 로만 적혀 있어 값이 없다. **null 로 옮긴다.**
 * 키는 만들어 두어야 관리자 화면에 칸이 나오고, 금액이 확정되면 채울 수 있다.
 */
async function seedAdmissionNumbers(): Promise<Counts> {
  const counts: Counts = { created: 0, skipped: 0 };

  const values: { key: string; value: string | null }[] = [
    { key: "tuition.mba", value: String(mbaFacts.tuition) },
    { key: "tuition.dba", value: String(dbaFacts.tuition) },
    { key: "fee.admissionReview", value: String(fees.admissionReview) },
    { key: "fee.lms", value: fees.lms === null ? null : String(fees.lms) },
    { key: "fee.administrative", value: String(fees.administrative) },
    { key: "intake.year", value: String(intake.year) },
    { key: "intake.month", value: String(intake.month) },
    { key: "exchangeRate.base", value: String(exchangeRateBase) },
  ];

  for (const entry of values) {
    const existing = await prisma.siteSetting.findUnique({
      where: { key: entry.key },
      select: { id: true },
    });

    if (existing) {
      counts.skipped += 1;
      continue;
    }

    await prisma.siteSetting.create({ data: entry });
    counts.created += 1;
  }

  return counts;
}

// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(
    "페이지 콘텐츠를 DB 로 이관합니다. 이미 있는 항목은 건드리지 않습니다.\n",
  );

  // 정적 콘텐츠는 과정 수치를 받아 문장을 만든다. 9단계부터 그 수치의 출처는 DB 다.
  const programs = await prisma.program.findMany({
    select: {
      type: true,
      durationSemesters: true,
      totalCredits: true,
      majorCredits: true,
      commonCredits: true,
      chapelCourses: true,
    },
  });

  const empty: ProgramNumbers = {
    durationSemesters: null,
    totalCredits: null,
    majorCredits: null,
    commonCredits: null,
    chapelCourses: null,
  };

  const numbers = { MBA: empty, DBA: empty } as Record<
    ProgramType,
    ProgramNumbers
  >;

  for (const program of programs) {
    numbers[program.type] = {
      durationSemesters: program.durationSemesters,
      totalCredits: program.totalCredits,
      majorCredits: program.majorCredits,
      commonCredits: program.commonCredits,
      chapelCourses: program.chapelCourses,
    };
  }

  const ko = getPageContent("ko", numbers);
  const en = getPageContent("en", numbers);

  const pages: { key: string; sections: SectionSeed[] }[] = [
    { key: "about", sections: aboutSections(ko, en) },
    { key: "degree", sections: degreeSections(ko, en) },
    { key: "admission", sections: admissionSections(ko, en) },
    { key: "faq", sections: faqSections(ko, en) },
  ];

  for (const page of pages) {
    const result = await seedSections(page.key, page.sections);
    summarize(`${page.key} 섹션`, result.sections);

    if (result.items.created + result.items.skipped > 0) {
      summarize(`${page.key} 항목`, result.items);
    }
  }

  summarize("FAQ", await seedFaqs(ko, en));
  summarize("입학안내 수치", await seedAdmissionNumbers());

  const [sections, items, faqs, settings] = await Promise.all([
    prisma.pageSection.count(),
    prisma.pageSectionItem.count(),
    prisma.fAQ.count(),
    prisma.siteSetting.count(),
  ]);

  console.log(
    `\n현재 DB: PageSection ${sections} / PageSectionItem ${items} / FAQ ${faqs} / SiteSetting ${settings}`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(
      "이관에 실패했습니다:",
      error instanceof Error ? error.message : "알 수 없는 오류",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
