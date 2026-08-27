import "dotenv/config";
import { prisma } from "../src/lib/prisma";

/**
 * 교수 저서 · 언론보도 데이터 이관. (15단계 · 16단계에서 upsert 로 바꿈)
 *
 *   npm run seed:works
 *
 * `seed:cms` · `seed:pages` 와 같은 성격의 이관 스크립트다.
 * 배포마다 자동 실행되지 않는다. (`prisma db seed` 에 연결하지 않았다)
 *
 * ## 다시 실행해도 안전하다 — 다만 15단계와 동작이 다르다
 *
 * 자연키로 먼저 찾는다. **저서는 ISBN 또는 외부 링크, 기사는 외부 링크**다.
 * 찾으면 **그 행을 갱신하고, 없을 때만 새로 만든다.** 어느 쪽이든 건수는 늘지 않는다.
 *
 * 15단계에는 "있으면 건너뛴다" 였다. 그래서 아래 문구를 다듬어도 이미 들어간 행에는
 * 반영되지 않았고, 고치려면 CMS 를 열거나 행을 지워야 했다. 16단계에서 이 스크립트를
 * **문구의 출처**로 삼기로 하고 upsert 로 바꿨다.
 *
 * > ⚠️ 그래서 **관리자가 CMS 에서 다듬은 문구는 이 스크립트를 다시 돌리면 덮인다.**
 * > 운영에서 문구를 고친 뒤에는 이 스크립트를 돌리지 않거나, 고친 내용을
 * > 여기에도 함께 반영한다. 갱신 대상은 아래 두 건뿐이고 다른 행은 건드리지 않는다.
 *
 * 지우는 동작은 하나도 없다. `sortOrder` · `isPublished` 는 **처음 만들 때만** 정하고
 * 갱신할 때는 손대지 않는다. 관리자가 순서를 바꾸거나 감춰 둔 것을 되돌리지 않기 위해서다.
 *
 * ## 값의 출처
 *
 * 두 원본 페이지에서 **직접 확인한 값만** 넣는다. 추측해서 채운 칸은 없다.
 *
 *   기사 — https://m.blog.naver.com/news-repository/224338806566
 *          제목·게시처·게시일·본문 모두 그 게시물에서 확인했다.
 *   저서 — https://product.kyobobook.co.kr/detail/S000218752366
 *          도서명·저자·출판사·발행일·ISBN 모두 그 상품 페이지에서 확인했다.
 *
 * 두 자료가 **김동준 주임교수 본인의 것임은 사용자 확인을 받았다.** (16단계)
 * 15단계에 남겨 두었던 "저자 동일인 여부 미확정" 은 이것으로 해소되었다.
 *
 * **소개 문구는 원문을 옮긴 것이 아니라 우리가 새로 쓴 요약이다.** (CLAUDE.md 22항)
 * 기사 본문도 서점 상품설명도 통째로 저장하지 않는다.
 *
 * **이미지는 넣지 않는다.** 기사 사진과 책 표지의 사용권이 확인되지 않았다.
 * 표지·사진이 필요해지면 사용권이 확인된 파일을 [미디어] 에 올려 CMS 에서 연결한다.
 *
 * ## 확인되지 않아 비워 둔 칸
 *
 * 아래 `null` 인 칸은 "아직 안 넣었다" 가 아니라 **원본에 없어서 비워 둔 것**이다.
 * 자세한 목록은 docs/progress.md 에 적어 두었다.
 */

/** 교수를 이름으로 찾는다. 동명이인이 생기면 사람이 직접 확인해야 한다. */
async function findFaculty(nameKo: string): Promise<string> {
  const rows = await prisma.faculty.findMany({
    where: { nameKo },
    select: { id: true },
  });

  if (rows.length === 0) {
    throw new Error(
      `${nameKo} 교수를 찾을 수 없습니다. 먼저 npm run seed:cms 를 실행하세요.`,
    );
  }

  if (rows.length > 1) {
    throw new Error(
      `${nameKo} 교수가 ${rows.length}건입니다. 어느 쪽에 연결할지 사람이 정해야 합니다.`,
    );
  }

  return rows[0].id;
}

/** 날짜만 저장하는 칸(`@db.Date`)에 넣을 값. 정오로 만들어 시간대에 밀리지 않게 한다. */
function onDate(value: string): Date {
  return new Date(`${value}T12:00:00Z`);
}

async function main() {
  const facultyId = await findFaculty("김동준");

  // -------------------------------------------------------------------------
  // 주요 저서
  // -------------------------------------------------------------------------

  const bookUrl = "https://product.kyobobook.co.kr/detail/S000218752366";
  const bookIsbn = "9791173850844";

  /**
   * 아래 값들이 이 저서의 **출처**다. 갱신할 때도 그대로 다시 쓴다.
   * `sortOrder` · `isPublished` 는 여기 없다. 그 둘은 만들 때만 정한다.
   */
  const book = {
    titleKo: "오늘 저녁은 와인 어때요?",
    // 상품 페이지에 공식 영문 도서명이 없다. 지어내지 않고 비워 둔다.
    // 영문 페이지에서는 한국어 원표기가 그대로 나온다. (`pickLocale`)
    titleEn: null,
    // 부제 없음. 상품 페이지의 `titleAlias` 가 비어 있다.
    subtitleKo: null,
    subtitleEn: null,
    authorKo: "김동준",
    // 교수 기본정보(`Faculty.nameEn`)에 확정되어 있는 표기를 그대로 쓴다.
    authorEn: "Dong-Joon Kim",
    publisherKo: "백산출판사",
    // 출판사의 공식 영문 사명이 상품 페이지에 없다. 비워 둔다.
    publisherEn: null,
    publishedAt: onDate("2025-12-10"),
    isbn: bookIsbn,
    // 아래 세 문장은 상품 설명을 옮긴 것이 아니라 우리가 쓴 요약이다.
    // 다루는 주제 · 읽는 사람 · 책의 특징까지만 적고 광고 문구를 만들지 않는다.
    descriptionKo:
      "우리가 매일 먹는 한국 음식에 어울리는 와인을 짝지어 소개하는 와인 입문서입니다. 라벨과 포도 품종을 외우는 대신, 어떤 음식과 곁들일 때 더 좋은지에서 출발합니다. 와인을 어렵게 느껴 온 일반 독자를 위해 쓰였습니다.",
    descriptionEn:
      "An introduction to wine that pairs everyday Korean dishes with wines to match. Rather than starting from labels and grape varieties, it begins with a simpler question — what tastes better together. Written in Korean for readers who have found wine hard to approach.",
    externalUrl: bookUrl,
    // 표지는 사용권이 확인되지 않아 넣지 않는다. 화면은 글자 표지를 그린다.
    coverMediaId: null,
  };

  // 자연키: ISBN 또는 외부 링크. 둘 중 하나만 맞아도 같은 책으로 본다.
  // 링크는 서점이 바뀌면 달라질 수 있고, ISBN 이 없는 자료도 있을 수 있다.
  const existingBook = await prisma.facultyBook.findFirst({
    where: { facultyId, OR: [{ isbn: bookIsbn }, { externalUrl: bookUrl }] },
    select: { id: true },
  });

  if (existingBook) {
    await prisma.facultyBook.update({ where: { id: existingBook.id }, data: book });
    console.log(`- 저서: 갱신 (${book.titleKo})`);
  } else {
    await prisma.facultyBook.create({
      data: { ...book, facultyId, sortOrder: 0, isPublished: true },
    });
    console.log(`- 저서: 등록 (${book.titleKo})`);
  }

  // -------------------------------------------------------------------------
  // 언론 · 미디어
  // -------------------------------------------------------------------------

  const articleUrl = "https://m.blog.naver.com/news-repository/224338806566";

  const article = {
    // 게시물 제목에서 블로그명 접두어("뉴스보고- ")만 뗀 기사 제목이다.
    titleKo:
      '[현장에서] "와인은 술이 아니라 문화였다"…안동에서 피어난 한국 와인기사단의 품격',
    // 한국어 기사이고 공식 영문 제목이 없다. 지어내지 않는다.
    // 영문 페이지에는 한국어 원제가 그대로 나오고, 내용은 아래 요약이 설명한다.
    titleEn: null,
    // 아래 두 문장은 기사 본문을 옮긴 것이 아니라 우리가 쓴 요약이다.
    // 김동준 교수가 그 자리에서 무엇을 했는지가 읽는 사람에게 필요한 정보다.
    summaryKo:
      "2026년 7월 안동에서 열린 FICB 한국와인기사단 기사작위식과 와인 투어를 다룬 기사입니다. 김동준 주임교수가 FICB 한국 총사령관으로 행사를 이끌며, 와인을 전통문화·미식·관광과 잇는 문화 콘텐츠로 소개했습니다.",
    summaryEn:
      "A report on the investiture ceremony and wine tour held in Andong in July 2026 by the Korean branch of the FICB, which Professor Kim led as its head in Korea. He presented wine as a cultural format connecting heritage, gastronomy and tourism. The article is written in Korean.",
    publisherKo: "뉴스보고",
    // 게시물 본문에 매체가 스스로 병기한 영문 표기다. (블로그 주소도 news-repository)
    publisherEn: "News Repository",
    publishedAt: onDate("2026-07-07"),
    externalUrl: articleUrl,
    // 기사 사진은 사용권이 확인되지 않아 넣지 않는다. hotlink 도 하지 않는다.
    imageMediaId: null,
  };

  const existingArticle = await prisma.facultyArticle.findFirst({
    where: { facultyId, externalUrl: articleUrl },
    select: { id: true },
  });

  if (existingArticle) {
    await prisma.facultyArticle.update({
      where: { id: existingArticle.id },
      data: article,
    });
    console.log("- 기사: 갱신 (안동 기사작위식 보도)");
  } else {
    await prisma.facultyArticle.create({
      data: { ...article, facultyId, sortOrder: 0, isPublished: true },
    });
    console.log("- 기사: 등록 (안동 기사작위식 보도)");
  }

  // 건수를 찍어 둔다. 재실행했을 때 늘어나지 않는 것을 눈으로 확인할 수 있다.
  const [books, articles] = await Promise.all([
    prisma.facultyBook.count(),
    prisma.facultyArticle.count(),
  ]);
  console.log(`완료. FacultyBook ${books}건 · FacultyArticle ${articles}건`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
