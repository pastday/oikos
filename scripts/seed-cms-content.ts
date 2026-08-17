import "dotenv/config";
import type { CourseCategory, ProgramType } from "../src/generated/prisma/enums";
import { prisma } from "../src/lib/prisma";
import { coursesKo } from "../src/content/courses/ko";
import { coursesEn } from "../src/content/courses/en";
import { dbaCurriculum, mbaCurriculum } from "../src/content/courses/curriculum";
import type { CourseKey, Curriculum } from "../src/content/courses";

/**
 * 정적 콘텐츠 → DB 일회성 이관 스크립트.
 *
 *   npm run seed:cms
 *
 * 9단계에서 교수진 · 과정 · 교과목의 출처를 `src/content/` 파일에서 PostgreSQL 로 옮긴다.
 * 이 스크립트는 그 **한 번의 이관**을 위한 것이며, 배포마다 자동 실행되지 않는다.
 * (`prisma db seed` 에 연결하지 않은 이유다. 운영 데이터를 덮어쓰면 안 된다)
 *
 * ## 다시 실행해도 안전하다
 *
 * 모든 항목을 자연키로 먼저 찾고, **이미 있으면 건드리지 않는다.**
 * 관리자가 CMS 에서 고친 내용을 스크립트가 되돌리는 일이 없어야 하기 때문이다.
 *
 *   Program : type
 *   Faculty : (type, nameKo)
 *   Course  : (programId, category, titleKo)
 *
 * ## 원본 자료의 불일치는 그대로 옮긴다
 *
 * 학점 미표기, 교과 내용 없음, 학기차 미지정은 **null 로 이관한다.**
 * 임의로 값을 채우지 않는다. (CLAUDE.md 23항)
 */

// ---------------------------------------------------------------------------
// 과정
// ---------------------------------------------------------------------------

/**
 * 과정 수치의 출처는 원본 모집 이미지와 소개 문서다.
 * 지금까지 `src/content/program-facts.ts` 에 있던 값을 그대로 옮긴다. 새로 만들지 않는다.
 */
const programSeeds = [
  {
    type: "MBA" as ProgramType,
    nameKo: "경영학석사 (MBA)",
    nameEn: "Master of Business Administration (MBA)",
    descriptionKo:
      "일하면서 학위과정을 병행하려는 실무 전문가에 맞춘 전문형 경영학 석사과정입니다.",
    descriptionEn:
      "A professional master's program designed for working practitioners who study alongside their careers.",
    durationSemesters: 4,
    totalCredits: 36,
    majorCredits: 24,
    commonCredits: 12,
    chapelCourses: 3,
    classMethodKo: "100% 온라인",
    classMethodEn: "100% online",
    graduationRequirementsKo:
      "총 36학점(전공 24학점, 공통 12학점)을 취득하고 채플 3과목을 이수합니다. 채플은 학점과 별도입니다.",
    graduationRequirementsEn:
      "Complete 36 credits in total (24 major, 12 common) and 3 chapel courses. Chapel is required separately from credits.",
    careerKo: null,
    careerEn: null,
  },
  {
    type: "DBA" as ProgramType,
    nameKo: "경영학박사 (DBA)",
    nameEn: "Doctor of Business Administration (DBA)",
    descriptionKo:
      "호텔·외식·와인 경영 분야의 실무 경험을 경영학 이론과 접목하는 실무 전문형 박사과정입니다.",
    descriptionEn:
      "A professional doctoral program connecting practical experience in hotel, foodservice and wine management with business theory.",
    durationSemesters: 6,
    totalCredits: 45,
    majorCredits: 30,
    commonCredits: 15,
    chapelCourses: 4,
    classMethodKo: "100% 온라인",
    classMethodEn: "100% online",
    graduationRequirementsKo:
      "총 45학점(전공 30학점, 공통 15학점)을 취득하고 채플 4과목을 이수합니다. 6학기는 논문학기로 운영됩니다.",
    graduationRequirementsEn:
      "Complete 45 credits in total (30 major, 15 common) and 4 chapel courses. Semester 6 is dedicated to the dissertation.",
    careerKo: null,
    careerEn: null,
  },
];

// ---------------------------------------------------------------------------
// 교수진
// ---------------------------------------------------------------------------

/**
 * 원본 자료에서 확인되는 교수는 주임교수 1인뿐이다. 없는 교수를 만들지 않는다.
 *
 * **명함의 이메일·전화·주소는 넣지 않는다.** 대표 연락처로 확정되지 않았고,
 * 개인정보를 공개 페이지에 노출하지 않기로 한 기존 결정을 그대로 따른다.
 */
const facultySeeds = [
  {
    type: "CHIEF_PROFESSOR" as const,
    nameKo: "김동준",
    nameEn: "Dong-Joon Kim",
    titleKo: "주임교수",
    titleEn: "Chief Professor",
    majorKo: "호텔·외식·와인경영 전공",
    majorEn: "Hotel, Foodservice & Wine Management",
    careerKo: null,
    careerEn: null,
    lectureFieldsKo: null,
    lectureFieldsEn: null,
    photoUrl: null,
    sortOrder: 0,
  },
];

// ---------------------------------------------------------------------------
// 교과목
// ---------------------------------------------------------------------------

type CourseSeed = {
  key: CourseKey;
  semester: number | null;
  category: CourseCategory;
  sortOrder: number;
};

/**
 * 편성표를 DB 행 목록으로 편다.
 *
 * 학기차가 지정되지 않은 전공과목과 공통과목은 `semester = null` 로 둔다.
 * 임의 학기를 배정하지 않기 위한 것이며, 이 때문에 schema 에서 semester 를 nullable 로 바꿨다.
 */
function flattenCurriculum(curriculum: Curriculum): CourseSeed[] {
  const seeds: CourseSeed[] = [];

  for (const group of curriculum.bySemester) {
    group.courseKeys.forEach((key, index) => {
      seeds.push({
        key,
        semester: group.semester,
        category: "MAJOR",
        sortOrder: index,
      });
    });
  }

  curriculum.additionalMajor.forEach((key, index) => {
    seeds.push({ key, semester: null, category: "MAJOR", sortOrder: index });
  });

  curriculum.common.forEach((key, index) => {
    seeds.push({ key, semester: null, category: "COMMON", sortOrder: index });
  });

  return seeds;
}

// ---------------------------------------------------------------------------

type Counts = { created: number; skipped: number };

function summarize(label: string, counts: Counts): void {
  console.log(
    `  ${label.padEnd(12)} 생성 ${counts.created}건 / 이미 있어 건너뜀 ${counts.skipped}건`,
  );
}

async function seedPrograms(): Promise<Counts> {
  const counts: Counts = { created: 0, skipped: 0 };

  for (const seed of programSeeds) {
    const existing = await prisma.program.findUnique({
      where: { type: seed.type },
      select: { id: true },
    });

    if (existing) {
      counts.skipped += 1;
      continue;
    }

    await prisma.program.create({ data: seed });
    counts.created += 1;
  }

  return counts;
}

async function seedFaculty(): Promise<Counts> {
  const counts: Counts = { created: 0, skipped: 0 };

  for (const seed of facultySeeds) {
    const existing = await prisma.faculty.findFirst({
      where: { type: seed.type, nameKo: seed.nameKo },
      select: { id: true },
    });

    if (existing) {
      counts.skipped += 1;
      continue;
    }

    await prisma.faculty.create({ data: seed });
    counts.created += 1;
  }

  return counts;
}

async function seedCourses(
  type: ProgramType,
  curriculum: Curriculum,
): Promise<Counts> {
  const counts: Counts = { created: 0, skipped: 0 };

  const program = await prisma.program.findUnique({
    where: { type },
    select: { id: true },
  });

  if (!program) {
    throw new Error(`${type} 과정이 없습니다. 과정을 먼저 만들어야 합니다.`);
  }

  for (const seed of flattenCurriculum(curriculum)) {
    const ko = coursesKo[seed.key];
    const en = coursesEn[seed.key];

    const existing = await prisma.course.findFirst({
      where: {
        programId: program.id,
        category: seed.category,
        titleKo: ko.title,
      },
      select: { id: true },
    });

    if (existing) {
      counts.skipped += 1;
      continue;
    }

    // 영문 카탈로그에서 title 이 한국어와 같으면 원본에 영문명이 없다는 뜻이다.
    // 영문명을 지어내지 않고 null 로 둔다. 화면에서는 한국어 원표기가 그대로 나온다.
    const titleEn = en.title === ko.title ? null : en.title;

    await prisma.course.create({
      data: {
        programId: program.id,
        semester: seed.semester,
        credits: ko.credits,
        titleKo: ko.title,
        titleEn,
        // 원본에 교과 내용이 없거나 다른 과목과 중복 기재된 과목은 null 그대로 옮긴다.
        descriptionKo: ko.description,
        descriptionEn: en.description,
        category: seed.category,
        sortOrder: seed.sortOrder,
        isPublished: true,
      },
    });
    counts.created += 1;
  }

  return counts;
}

async function main(): Promise<void> {
  console.log("정적 콘텐츠를 DB 로 이관합니다. 이미 있는 항목은 건드리지 않습니다.\n");

  summarize("Program", await seedPrograms());
  summarize("Faculty", await seedFaculty());
  summarize("Course(MBA)", await seedCourses("MBA", mbaCurriculum));
  summarize("Course(DBA)", await seedCourses("DBA", dbaCurriculum));

  const [programs, faculty, courses] = await Promise.all([
    prisma.program.count(),
    prisma.faculty.count(),
    prisma.course.count(),
  ]);

  console.log(
    `\n현재 DB: Program ${programs} / Faculty ${faculty} / Course ${courses}`,
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
