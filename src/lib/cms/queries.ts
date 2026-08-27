import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import type { ProgramType } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { admissionNumberKeys } from "./page-catalog";
import {
  formatPublishedDate,
  formatPublishedYear,
  joinMeta,
  pickLocale,
  pickLocaleOptional,
  toLines,
  toMediaView,
  toParagraphs,
  toSafeUrl,
  type AdmissionNumbers,
  type CourseView,
  type FacultyArticleView,
  type FacultyBookView,
  type FacultyGroup,
  type FacultyView,
  type FaqView,
  type PageSectionMap,
  type ProgramCurriculum,
  type ProgramNumbers,
  type ProgramView,
} from "./types";

/**
 * 공개 화면용 CMS 조회.
 *
 * 9단계부터 **교수진 · 과정 · 교과목은 DB 가 유일한 출처**다.
 * 정적 콘텐츠 파일을 fallback 으로 함께 읽지 않는다. 두 값이 갈라지면
 * 관리자가 고친 내용과 화면이 달라져 더 나쁘기 때문이다.
 *
 * 페이지는 정적 생성되고 관리자가 저장할 때만 다시 만들어지므로
 * 이 함수들은 빌드·재생성 시점에만 실행된다. 방문자 요청마다 DB 를 조회하지 않는다.
 *
 * 같은 렌더 안에서 여러 번 불려도 한 번만 조회하도록 React `cache` 로 감싼다.
 * (예: generateMetadata 와 페이지 본문이 같은 데이터를 필요로 할 때)
 */

// ---------------------------------------------------------------------------
// 교수진
// ---------------------------------------------------------------------------

/** 이름에서 아바타용 이니셜을 만든다. 사진이 없을 때만 쓰인다. */
function toInitials(nameKo: string, nameEn: string | null): string {
  const source = nameEn?.trim();
  if (source) {
    // 공백으로만 나눈다. "Dong-Joon Kim" 은 두 낱말이므로 DK 가 된다.
    // 하이픈까지 구분자로 쓰면 DJ 가 되어 기존 표기와 달라진다.
    const parts = source.split(/\s+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }
  // 한국어 이름은 성을 제외한 이름 부분을 쓰면 두 글자가 되어 읽기 좋다.
  return nameKo.slice(-2);
}

/** Media 조회에서 실제로 쓰는 칸. 표지·기사 이미지도 교수 사진과 같은 모양이다. */
type MediaRow = {
  path: string;
  altKo: string | null;
  altEn: string | null;
  originalName: string;
  size: number;
};

type FacultyBookRow = {
  id: string;
  titleKo: string;
  titleEn: string | null;
  subtitleKo: string | null;
  subtitleEn: string | null;
  authorKo: string | null;
  authorEn: string | null;
  publisherKo: string | null;
  publisherEn: string | null;
  publishedAt: Date | null;
  descriptionKo: string | null;
  descriptionEn: string | null;
  externalUrl: string | null;
  cover: MediaRow | null;
};

/**
 * 저서 한 권.
 *
 * 저자 · 출판사 · 발행연도는 **한 줄로 합쳐서** 넘긴다. 화면마다 이 셋을 다시 조립하면
 * A안과 B안의 표기가 갈린다. 발행일은 연도까지만 쓴다. 카드 안의 보조 정보라
 * 날짜까지 적으면 제목보다 줄이 길어진다.
 */
function toFacultyBookView(
  locale: Locale,
  row: FacultyBookRow,
): FacultyBookView {
  return {
    id: row.id,
    title: pickLocale(locale, row.titleKo, row.titleEn),
    subtitle: pickLocaleOptional(locale, row.subtitleKo, row.subtitleEn),
    meta: joinMeta([
      pickLocaleOptional(locale, row.authorKo, row.authorEn),
      pickLocaleOptional(locale, row.publisherKo, row.publisherEn),
      formatPublishedYear(row.publishedAt),
    ]),
    description: pickLocaleOptional(
      locale,
      row.descriptionKo,
      row.descriptionEn,
    ),
    url: toSafeUrl(row.externalUrl),
    cover: toMediaView(locale, row.cover),
  };
}

type FacultyArticleRow = {
  id: string;
  titleKo: string;
  titleEn: string | null;
  summaryKo: string | null;
  summaryEn: string | null;
  publisherKo: string | null;
  publisherEn: string | null;
  publishedAt: Date | null;
  externalUrl: string | null;
  image: MediaRow | null;
};

/** 기사 한 건. 게시처와 게시일을 한 줄로 합친다. 저서와 달리 날짜까지 적는다. */
function toFacultyArticleView(
  locale: Locale,
  row: FacultyArticleRow,
): FacultyArticleView {
  return {
    id: row.id,
    title: pickLocale(locale, row.titleKo, row.titleEn),
    summary: pickLocaleOptional(locale, row.summaryKo, row.summaryEn),
    meta: joinMeta([
      pickLocaleOptional(locale, row.publisherKo, row.publisherEn),
      formatPublishedDate(locale, row.publishedAt),
    ]),
    url: toSafeUrl(row.externalUrl),
    image: toMediaView(locale, row.image),
  };
}

function toFacultyView(
  locale: Locale,
  row: {
    books: FacultyBookRow[];
    articles: FacultyArticleRow[];
    id: string;
    type: FacultyView["type"];
    nameKo: string;
    nameEn: string | null;
    titleKo: string | null;
    titleEn: string | null;
    majorKo: string | null;
    majorEn: string | null;
    bioKo: string | null;
    bioEn: string | null;
    educationKo: string | null;
    educationEn: string | null;
    careerKo: string | null;
    careerEn: string | null;
    lectureFieldsKo: string | null;
    lectureFieldsEn: string | null;
    photo: {
      path: string;
      altKo: string | null;
      altEn: string | null;
      originalName: string;
      size: number;
    } | null;
  },
): FacultyView {
  const name = pickLocale(locale, row.nameKo, row.nameEn);
  const other = locale === "ko" ? row.nameEn?.trim() : row.nameKo.trim();

  return {
    id: row.id,
    type: row.type,
    name,
    // 같은 값이면 두 번 보여주지 않는다.
    nameAlt: other && other !== name ? other : null,
    title: pickLocaleOptional(locale, row.titleKo, row.titleEn),
    major: pickLocaleOptional(locale, row.majorKo, row.majorEn),
    // 소개는 줄글이라 문단으로, 나머지 셋은 한 줄이 한 항목이라 목록으로 나눈다.
    // 관리자가 입력한 글은 여기서도 화면에서도 HTML 로 해석하지 않는다.
    bio: toParagraphs(pickLocaleOptional(locale, row.bioKo, row.bioEn)),
    education: toLines(
      pickLocaleOptional(locale, row.educationKo, row.educationEn),
    ),
    career: toLines(pickLocaleOptional(locale, row.careerKo, row.careerEn)),
    lectureFields: toLines(
      pickLocaleOptional(locale, row.lectureFieldsKo, row.lectureFieldsEn),
    ),
    photo: toMediaView(locale, row.photo),
    initials: toInitials(row.nameKo, row.nameEn),
    books: row.books.map((book) => toFacultyBookView(locale, book)),
    articles: row.articles.map((article) =>
      toFacultyArticleView(locale, article),
    ),
  };
}

const facultySelect = {
  id: true,
  type: true,
  nameKo: true,
  nameEn: true,
  titleKo: true,
  titleEn: true,
  majorKo: true,
  majorEn: true,
  bioKo: true,
  bioEn: true,
  educationKo: true,
  educationEn: true,
  careerKo: true,
  careerEn: true,
  lectureFieldsKo: true,
  lectureFieldsEn: true,
  photo: true,
  /**
   * 주요 저서 · 언론보도. (15단계)
   *
   * **공개된 것만 가져온다.** 비공개 항목은 화면에서 빠져야 하는데, 여기서 전부 가져와
   * 화면에서 거르면 걸러야 한다는 사실을 화면마다 기억해야 한다. 한 곳에서 막는다.
   *
   * `sortOrder` 가 같으면 `createdAt` 으로 안정적으로 정렬한다.
   * 교수진 목록 정렬(`sortOrder` → 이름)과 같은 이유다.
   */
  books: {
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      titleKo: true,
      titleEn: true,
      subtitleKo: true,
      subtitleEn: true,
      authorKo: true,
      authorEn: true,
      publisherKo: true,
      publisherEn: true,
      publishedAt: true,
      descriptionKo: true,
      descriptionEn: true,
      externalUrl: true,
      cover: true,
    },
  },
  articles: {
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      titleKo: true,
      titleEn: true,
      summaryKo: true,
      summaryEn: true,
      publisherKo: true,
      publisherEn: true,
      publishedAt: true,
      externalUrl: true,
      image: true,
    },
  },
  /**
   * `as const` 가 아니라 `satisfies` 를 쓴다. `as const` 로 굳히면 위 `orderBy` 배열이
   * readonly 가 되어 Prisma 가 받아 주지 않는다. `satisfies` 는 오타를 그대로 잡아 주면서
   * 배열을 그대로 둔다.
   */
} satisfies Prisma.FacultySelect;

/**
 * 공개된 교수진을 구분별로 묶어 돌려준다.
 *
 * **비어 있는 구분은 아예 넣지 않는다.** 자료가 없는 상태에서 빈 카드를 여러 개
 * 늘어놓지 않는다는 기존 정책을 그대로 따른다.
 */
export const getPublishedFacultyGroups = cache(
  async (locale: Locale): Promise<FacultyGroup[]> => {
    const rows = await prisma.faculty.findMany({
      where: { isPublished: true },
      // sortOrder 가 같으면 이름으로 안정적으로 정렬한다.
      orderBy: [{ sortOrder: "asc" }, { nameKo: "asc" }],
      select: facultySelect,
    });

    const order = ["CHIEF_PROFESSOR", "PROFESSOR", "VISITING_PROFESSOR"] as const;
    const groups: FacultyGroup[] = [];

    for (const type of order) {
      const members = rows
        .filter((row) => row.type === type)
        .map((row) => toFacultyView(locale, row));

      if (members.length > 0) groups.push({ type, members });
    }

    return groups;
  },
);

/** 메인 페이지 Preview 용. 주임교수 중 첫 번째. */
export const getChiefProfessor = cache(
  async (locale: Locale): Promise<FacultyView | null> => {
    const row = await prisma.faculty.findFirst({
      where: { isPublished: true, type: "CHIEF_PROFESSOR" },
      orderBy: [{ sortOrder: "asc" }, { nameKo: "asc" }],
      select: facultySelect,
    });

    return row ? toFacultyView(locale, row) : null;
  },
);

// ---------------------------------------------------------------------------
// 과정
// ---------------------------------------------------------------------------

const programSelect = {
  id: true,
  type: true,
  nameKo: true,
  nameEn: true,
  descriptionKo: true,
  descriptionEn: true,
  durationSemesters: true,
  totalCredits: true,
  majorCredits: true,
  commonCredits: true,
  chapelCourses: true,
  classMethodKo: true,
  classMethodEn: true,
  graduationRequirementsKo: true,
  graduationRequirementsEn: true,
  careerKo: true,
  careerEn: true,
} as const;

/** 공개된 과정 하나. 비공개거나 없으면 null. */
export const getPublishedProgram = cache(
  async (type: ProgramType, locale: Locale): Promise<ProgramView | null> => {
    const row = await prisma.program.findFirst({
      where: { type, isPublished: true },
      select: programSelect,
    });

    if (!row) return null;

    return {
      id: row.id,
      type: row.type,
      name: pickLocale(locale, row.nameKo, row.nameEn),
      description: pickLocaleOptional(
        locale,
        row.descriptionKo,
        row.descriptionEn,
      ),
      classMethod: pickLocaleOptional(
        locale,
        row.classMethodKo,
        row.classMethodEn,
      ),
      graduationRequirements: pickLocaleOptional(
        locale,
        row.graduationRequirementsKo,
        row.graduationRequirementsEn,
      ),
      career: pickLocaleOptional(locale, row.careerKo, row.careerEn),
      durationSemesters: row.durationSemesters,
      totalCredits: row.totalCredits,
      majorCredits: row.majorCredits,
      commonCredits: row.commonCredits,
      chapelCourses: row.chapelCourses,
    };
  },
);

/**
 * 두 과정의 수치를 한 번에 읽는다.
 *
 * 학점·학기 수는 MBA/DBA 상세뿐 아니라 입학안내·FAQ 문구에도 등장한다.
 * 여러 페이지가 각자 조회하지 않도록 여기서 한 번에 가져오고,
 * **비공개 과정도 포함**한다. (문구에 들어가는 수치는 과정 공개 여부와 별개다)
 */
export const getProgramNumbers = cache(
  async (): Promise<Record<ProgramType, ProgramNumbers>> => {
    const rows = await prisma.program.findMany({
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

    const result: Record<ProgramType, ProgramNumbers> = {
      MBA: { ...empty },
      DBA: { ...empty },
    };

    for (const row of rows) {
      result[row.type] = {
        durationSemesters: row.durationSemesters,
        totalCredits: row.totalCredits,
        majorCredits: row.majorCredits,
        commonCredits: row.commonCredits,
        chapelCourses: row.chapelCourses,
      };
    }

    return result;
  },
);

/** 목록/카드에서 쓸 공개 과정 요약 */
export const getPublishedPrograms = cache(
  async (locale: Locale): Promise<ProgramView[]> => {
    const types: ProgramType[] = ["MBA", "DBA"];
    const programs = await Promise.all(
      types.map((type) => getPublishedProgram(type, locale)),
    );
    return programs.filter((program): program is ProgramView => program !== null);
  },
);

// ---------------------------------------------------------------------------
// 교과목
// ---------------------------------------------------------------------------

function toCourseView(
  locale: Locale,
  row: {
    id: string;
    titleKo: string;
    titleEn: string | null;
    descriptionKo: string | null;
    descriptionEn: string | null;
    credits: number | null;
  },
): CourseView {
  const title = pickLocale(locale, row.titleKo, row.titleEn);
  const other = locale === "ko" ? row.titleEn?.trim() : row.titleKo.trim();

  return {
    id: row.id,
    title,
    titleAlt: other && other !== title ? other : null,
    credits: row.credits,
    description: pickLocaleOptional(
      locale,
      row.descriptionKo,
      row.descriptionEn,
    ),
  };
}

/** 메인 페이지 교육과정 Preview 에 보여줄 대표 과목 수 */
const HOME_COURSE_PREVIEW_COUNT = 6;

/**
 * 메인 페이지용 대표 교과목.
 *
 * 전체를 나열하지 않고 MBA 전공과목 중 학기 순으로 앞쪽 몇 과목만 보여준다.
 * 관리자가 교과목을 고치면 메인에도 반영된다.
 */
export const getHomeCoursePreview = cache(
  async (locale: Locale): Promise<CourseView[]> => {
    const rows = await prisma.course.findMany({
      where: {
        isPublished: true,
        category: "MAJOR",
        semester: { not: null },
        program: { type: "MBA", isPublished: true },
      },
      orderBy: [{ semester: "asc" }, { sortOrder: "asc" }, { titleKo: "asc" }],
      take: HOME_COURSE_PREVIEW_COUNT,
      select: {
        id: true,
        titleKo: true,
        titleEn: true,
        descriptionKo: true,
        descriptionEn: true,
        credits: true,
      },
    });

    return rows.map((row) => toCourseView(locale, row));
  },
);

/**
 * 한 과정의 교육과정을 화면 구조에 맞게 묶어 돌려준다.
 *
 * 정렬은 학기 → 표시순서 → 과목명 순이며, 학기가 없는 과목은 뒤로 보낸다.
 * (PostgreSQL 은 NULL 을 크게 보므로 asc 정렬에서 자연히 뒤로 간다)
 */
export const getProgramCurriculum = cache(
  async (programId: string, locale: Locale): Promise<ProgramCurriculum> => {
    const rows = await prisma.course.findMany({
      where: { programId, isPublished: true },
      orderBy: [
        { semester: "asc" },
        { sortOrder: "asc" },
        { titleKo: "asc" },
      ],
      select: {
        id: true,
        semester: true,
        category: true,
        titleKo: true,
        titleEn: true,
        descriptionKo: true,
        descriptionEn: true,
        credits: true,
      },
    });

    const bySemester = new Map<number, CourseView[]>();
    const additionalMajor: CourseView[] = [];
    const common: CourseView[] = [];

    for (const row of rows) {
      const view = toCourseView(locale, row);

      if (row.category === "COMMON") {
        common.push(view);
        continue;
      }

      if (row.semester === null) {
        // 원본에 학기차가 없던 전공과목
        additionalMajor.push(view);
        continue;
      }

      const group = bySemester.get(row.semester) ?? [];
      group.push(view);
      bySemester.set(row.semester, group);
    }

    return {
      bySemester: [...bySemester.entries()]
        .sort(([a], [b]) => a - b)
        .map(([semester, courses]) => ({ semester, courses })),
      additionalMajor,
      common,
    };
  },
);

// ---------------------------------------------------------------------------
// 페이지 콘텐츠 (10단계)
// ---------------------------------------------------------------------------

/**
 * 한 페이지의 공개된 섹션을 `sectionKey` 로 찾을 수 있게 돌려준다.
 *
 * **DB 에 행이 없는 섹션은 결과에 아예 없다.** 화면은 값이 없으면 그 섹션을 그리지 않는다.
 * 정적 콘텐츠 파일을 fallback 으로 함께 읽지 않는 이유는 9단계와 같다.
 * 두 출처가 갈라지면 관리자가 고친 내용과 화면이 달라져 더 나쁘다.
 * (다만 페이지 상단 intro 만은 예외다. 아래 `getPageIntro` 주석 참고)
 */
export const getPageSections = cache(
  async (pageKey: string, locale: Locale): Promise<PageSectionMap> => {
    const rows = await prisma.pageSection.findMany({
      where: { pageKey, isPublished: true },
      orderBy: { sortOrder: "asc" },
      include: {
        media: true,
        documentMedia: true,
        items: {
          where: { isPublished: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          include: { media: true },
        },
      },
    });

    const map: PageSectionMap = {};

    for (const row of rows) {
      map[row.sectionKey] = {
        title: pickLocaleOptional(locale, row.titleKo, row.titleEn),
        subtitle: pickLocaleOptional(locale, row.subtitleKo, row.subtitleEn),
        paragraphs: toParagraphs(
          pickLocaleOptional(locale, row.bodyKo, row.bodyEn),
        ),
        highlight: pickLocaleOptional(
          locale,
          row.highlightKo,
          row.highlightEn,
        ),
        note: pickLocaleOptional(locale, row.noteKo, row.noteEn),
        media: toMediaView(locale, row.media),
        document: toMediaView(locale, row.documentMedia),
        items: row.items.map((item) => ({
          id: item.id,
          label: pickLocaleOptional(locale, item.labelKo, item.labelEn),
          value: pickLocaleOptional(locale, item.valueKo, item.valueEn),
          variant: item.variant,
          media: toMediaView(locale, item.media),
        })),
      };
    }

    return map;
  },
);

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

/**
 * 공개된 FAQ.
 *
 * `sortOrder` 가 같은 항목이 있어도 순서가 흔들리지 않도록 `createdAt` 을 2차 기준으로 둔다.
 * (정렬 기준이 하나뿐이면 같은 값일 때 DB 가 돌려주는 순서가 매번 달라질 수 있다)
 */
export const getPublishedFaqs = cache(
  async (locale: Locale): Promise<FaqView[]> => {
    const rows = await prisma.fAQ.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return rows.map((row) => ({
      id: row.id,
      question: pickLocale(locale, row.questionKo, row.questionEn),
      answer: pickLocale(locale, row.answerKo, row.answerEn),
    }));
  },
);

// ---------------------------------------------------------------------------
// 입학안내 수치
// ---------------------------------------------------------------------------

/**
 * 등록금·수수료·개강 시점.
 *
 * 값이 비어 있거나 숫자로 읽을 수 없으면 `null` 이다. 화면은 "-" 로 표시한다.
 * 원본 자료에 금액이 없는 항목이 실제로 있어 비어 있는 상태가 정상이다.
 */
export const getAdmissionNumbers = cache(async (): Promise<AdmissionNumbers> => {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: admissionNumberKeys } },
    select: { key: true, value: true },
  });

  const result: AdmissionNumbers = {};
  for (const key of admissionNumberKeys) result[key] = null;

  for (const row of rows) {
    const raw = row.value?.trim();
    if (!raw) continue;

    const parsed = Number(raw);
    result[row.key] = Number.isFinite(parsed) ? parsed : null;
  }

  return result;
});
