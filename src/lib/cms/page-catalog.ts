/**
 * 페이지 콘텐츠 CMS 의 **구조 정의**.
 *
 * 어떤 `pageKey` / `sectionKey` 가 존재하는지, 각 섹션이 어떤 텍스트 슬롯과
 * 반복 항목을 쓰는지를 이 파일 한 곳에서 정한다.
 *
 * ## 왜 관리자가 섹션을 자유롭게 만들 수 없는가
 *
 * 공개 페이지의 레이아웃은 고정되어 있다. (10단계 원칙 1 — 디자인을 임의로 바꾸지 않는다)
 * 관리자가 임의의 섹션을 새로 만들어도 **그려 줄 화면이 없다.**
 * 그래서 섹션은 카탈로그가 정한 목록만 존재하고, 관리자는 그 안의 내용을 고친다.
 * 반대로 반복 항목(카드·팩트·절차·일정)은 개수가 늘어도 화면이 그대로 그려지므로
 * 관리자가 추가·삭제·정렬할 수 있다.
 *
 * ## 슬롯 이름이 화면과 1:1 이 아닌 이유
 *
 * `PageSection` 은 섹션 종류마다 컬럼을 따로 두지 않고 5개의 범용 슬롯을 공유한다.
 * 대신 **슬롯이 그 섹션에서 화면 어디에 나오는지는 카탈로그가 라벨로 설명한다.**
 * 예를 들어 `subtitle` 은 보통 "제목 아래 설명"이지만 intro 섹션에서는 "상단 라벨"이다.
 * 관리자 화면에는 카탈로그의 라벨이 표시되므로 슬롯 이름을 알 필요가 없다.
 */

export type SectionSlot = "title" | "subtitle" | "body" | "highlight" | "note";

export type SlotSpec = {
  /** 관리자 화면에 표시할 필드 이름 */
  label: string;
  /** 이 값이 화면 어디에 어떻게 나오는지 */
  hint?: string;
  /** 여러 줄 입력으로 그릴지 */
  multiline?: boolean;
};

export type SectionItemSpec = {
  /** 항목 묶음의 이름 (예: "교육 목표 카드") */
  title: string;
  description: string;
  /** 항목 추가 버튼 문구 */
  addLabel: string;
  /** label 을 쓰지 않는 목록이면 null (예: 등록금 비고) */
  label: SlotSpec | null;
  value: SlotSpec | null;
  /** 같은 목록 안에서 표시가 갈리는 경우에만 쓴다 */
  variants?: { value: string; label: string }[];
};

export type SectionSpec = {
  key: string;
  label: string;
  /** 이 섹션이 공개 페이지의 어디인지 */
  description: string;
  slots: Partial<Record<SectionSlot, SlotSpec>>;
  items?: SectionItemSpec;
  /** 카탈로그에 없는 내용이 화면에 함께 나올 때의 안내 (DB·정적 출처) */
  notice?: string;
};

export type PageSpec = {
  key: string;
  label: string;
  description: string;
  /** 공개 경로. 관리자 화면의 "페이지 보기" 링크에 쓴다. */
  path: string;
  sections: SectionSpec[];
};

// ---------------------------------------------------------------------------

/** 여러 섹션이 공유하는 슬롯 정의 */

const introSlots: Partial<Record<SectionSlot, SlotSpec>> = {
  subtitle: {
    label: "상단 라벨",
    hint: "제목 위에 작게 표시되는 문구입니다. (대문자·자간이 넓게 표시됩니다)",
  },
  title: {
    label: "제목",
    hint: "페이지의 대표 제목이며 검색엔진 제목(title)으로도 쓰입니다.",
  },
  body: {
    label: "설명",
    hint: "제목 아래 한 문단입니다. 검색엔진 설명(description)으로도 쓰입니다.",
    multiline: true,
  },
};

const bodyHint = "빈 줄로 문단을 나눕니다. 문단마다 따로 표시됩니다.";

// ---------------------------------------------------------------------------

const aboutPage: PageSpec = {
  key: "about",
  label: "대학원 소개",
  description: "총장 인사말 · 경영대학원 소개 · 교육철학 · 교육 목표 · 본교 소개",
  path: "/about",
  sections: [
    {
      key: "intro",
      label: "페이지 상단",
      description: "페이지 맨 위 남색 영역",
      slots: introSlots,
    },
    {
      key: "president",
      label: "총장 인사말",
      description: "점선 테두리 안내 상자",
      slots: {
        title: { label: "제목" },
        body: { label: "본문", hint: bodyHint, multiline: true },
      },
      notice:
        "원본 자료에 총장 인사말 본문이 없어 현재는 준비 중 안내만 있습니다. 본문이 확정되면 여기에 넣습니다.",
    },
    {
      key: "school",
      label: "경영대학원 소개",
      description: "회색 배경 섹션",
      slots: {
        title: { label: "제목" },
        body: { label: "본문", hint: bodyHint, multiline: true },
      },
    },
    {
      key: "philosophy",
      label: "교육철학",
      description: "흰 배경 섹션",
      slots: {
        title: { label: "제목" },
        body: { label: "본문", hint: bodyHint, multiline: true },
      },
    },
    {
      key: "goals",
      label: "교육 목표",
      description: "2열 카드 목록",
      slots: { title: { label: "제목" } },
      items: {
        title: "교육 목표 카드",
        description: "카드 하나가 목표 하나입니다. 화면에는 2열로 배치됩니다.",
        addLabel: "목표 추가",
        label: { label: "카드 제목" },
        value: { label: "카드 설명", multiline: true },
      },
    },
    {
      key: "university",
      label: "Oikos University 소개",
      description: "본문 + 오른쪽 정보 그리드",
      slots: {
        title: { label: "제목" },
        body: { label: "본문", hint: bodyHint, multiline: true },
      },
      items: {
        title: "정보 그리드",
        description: "오른쪽에 라벨과 값으로 표시됩니다.",
        addLabel: "항목 추가",
        label: { label: "항목명", hint: "예: 설립, 소재지" },
        value: { label: "값" },
      },
      notice:
        "아래 '인가 및 인증 정보 보기' · '미국 본교 홈페이지' 버튼 문구는 사이트 공통 링크라 이 화면에서 바꾸지 않습니다.",
    },
  ],
};

const degreePage: PageSpec = {
  key: "degree",
  label: "학위 및 인증",
  description: "학위 안내 · 외국 박사학위 신고제도 · 인가 및 인증 · 본교 소개",
  path: "/degree",
  sections: [
    {
      key: "intro",
      label: "페이지 상단",
      description: "페이지 맨 위 남색 영역",
      slots: introSlots,
    },
    {
      key: "degrees",
      label: "학위 안내",
      description: "MBA · DBA 카드 2개",
      slots: {
        title: { label: "제목" },
        subtitle: { label: "설명", hint: "제목 아래 한 줄" },
      },
      notice:
        "카드에 표시되는 학위명과 '4학기제 · 총 36학점' 같은 수치는 [MBA · DBA 과정] 화면의 값을 그대로 가져옵니다. 여기서 따로 입력하지 않습니다.",
    },
    {
      key: "foreign-doctorate",
      label: "외국 박사학위 신고제도",
      description: "회색 배경 섹션",
      slots: {
        title: { label: "제목" },
        body: { label: "본문", hint: bodyHint, multiline: true },
        highlight: {
          label: "강조 문구",
          hint: "금색 세로선이 있는 강조 상자에 표시됩니다.",
          multiline: true,
        },
        note: {
          label: "맺음 문단",
          hint: "강조 상자 아래에 본문과 같은 크기로 표시됩니다.",
          multiline: true,
        },
      },
    },
    {
      key: "accreditation",
      label: "인가 및 인증",
      description: "2열 카드 목록 + 하단 안내",
      slots: {
        title: { label: "제목" },
        subtitle: { label: "설명", hint: "제목 아래 한 줄" },
        note: { label: "하단 안내", hint: "목록 아래 작은 글씨", multiline: true },
      },
      items: {
        title: "인가 · 인증 항목",
        description: "기관 또는 제도 하나가 카드 하나입니다.",
        addLabel: "항목 추가",
        label: { label: "기관 · 제도명", hint: "예: TRACS 인증" },
        value: { label: "설명", multiline: true },
      },
    },
    {
      key: "university",
      label: "미국 본교 소개",
      description: "회색 배경 섹션",
      slots: {
        title: { label: "제목" },
        body: { label: "본문", hint: bodyHint, multiline: true },
      },
    },
    {
      key: "faq-link",
      label: "FAQ 안내 배너",
      description: "페이지 맨 아래 베이지색 배너",
      slots: {
        title: { label: "제목" },
        subtitle: { label: "설명" },
        note: { label: "버튼 문구", hint: "예: FAQ 보기" },
      },
    },
  ],
};

const admissionPage: PageSpec = {
  key: "admission",
  label: "입학안내",
  description: "모집안내 · 지원자격 · 등록금 · 입학절차 · 학사일정",
  path: "/admission",
  sections: [
    {
      key: "intro",
      label: "페이지 상단",
      description: "페이지 맨 위 남색 영역",
      slots: {
        ...introSlots,
        title: {
          label: "제목",
          hint: "예: 2026년 10월 개강. 개강 시점을 바꾸면 이 문구도 함께 고쳐야 합니다.",
        },
      },
    },
    {
      key: "recruit",
      label: "모집안내",
      description: "4칸 정보 그리드",
      slots: {
        title: { label: "제목" },
        subtitle: { label: "설명", hint: "제목 아래 한 줄" },
      },
      items: {
        title: "모집 정보",
        description: "라벨과 값으로 표시됩니다. 화면에는 4열로 배치됩니다.",
        addLabel: "항목 추가",
        label: { label: "항목명", hint: "예: 개강, 수업방식" },
        value: { label: "값" },
      },
      notice:
        "MBA · DBA 학기 수를 적어 두었다면 [MBA · DBA 과정] 화면에서 학기 수를 바꿀 때 이 값도 함께 고쳐야 합니다.",
    },
    {
      key: "eligibility",
      label: "지원자격",
      description: "회색 배경 섹션",
      slots: {
        title: { label: "제목" },
        body: { label: "본문", hint: bodyHint, multiline: true },
        note: { label: "하단 안내", hint: "본문 아래 작은 글씨", multiline: true },
      },
    },
    {
      key: "tuition",
      label: "등록금",
      description: "등록금 표 + 하단 비고",
      slots: {
        title: { label: "제목" },
        subtitle: { label: "설명", hint: "제목 아래 한 줄" },
      },
      items: {
        title: "비고",
        description: "표 아래에 작은 글씨로 한 줄씩 표시됩니다.",
        addLabel: "비고 추가",
        label: null,
        value: { label: "내용", multiline: true },
      },
      notice:
        "표에 들어가는 **금액**은 이 화면 위쪽 '입학안내 수치'에서, 과정 이름은 [MBA · DBA 과정] 화면에서 가져옵니다.",
    },
    {
      key: "steps",
      label: "입학절차",
      description: "STEP 1~5 카드 목록",
      slots: {
        title: { label: "제목" },
        subtitle: { label: "설명", hint: "제목 아래 한 줄" },
      },
      items: {
        title: "절차 단계",
        description:
          "표시순서대로 STEP 1, 2, 3… 번호가 자동으로 붙습니다. 번호를 직접 적지 마세요.",
        addLabel: "단계 추가",
        label: { label: "단계 제목" },
        value: { label: "설명", multiline: true },
      },
      notice:
        "설명에 금액을 적어 두었다면 '입학안내 수치'에서 금액을 바꿀 때 이 문구도 함께 고쳐야 합니다.",
    },
    {
      key: "calendar",
      label: "학사일정",
      description: "3열 일정 목록",
      slots: {
        title: { label: "제목" },
        subtitle: { label: "설명", hint: "제목 아래 한 줄" },
      },
      items: {
        title: "일정",
        description: "학기는 남색, 방학은 회색으로 표시됩니다.",
        addLabel: "일정 추가",
        label: { label: "이름", hint: "예: 1학기, 방학" },
        value: { label: "기간", hint: "예: 2 ~ 4월" },
        variants: [
          { value: "semester", label: "학기 (남색)" },
          { value: "break", label: "방학 (회색)" },
        ],
      },
    },
  ],
};

const faqPage: PageSpec = {
  key: "faq",
  label: "FAQ 페이지 안내문",
  description: "FAQ 페이지의 상단 문구와 하단 안내 (질문·답변은 [FAQ] 화면에서 관리)",
  path: "/faq",
  sections: [
    {
      key: "intro",
      label: "페이지 상단 · 하단 안내",
      description: "남색 영역과 목록 아래 안내",
      slots: {
        ...introSlots,
        note: {
          label: "하단 안내",
          hint: "질문 목록 아래에 표시됩니다.",
          multiline: true,
        },
      },
      notice: "질문과 답변 자체는 왼쪽 메뉴의 [FAQ] 에서 등록·수정합니다.",
    },
  ],
};

// ---------------------------------------------------------------------------

/**
 * 관리자 [페이지 콘텐츠] 목록에 나오는 순서.
 * 입학안내는 별도 메뉴에서 열지만 구조는 같으므로 여기에 함께 둔다.
 */
export const pageCatalog: PageSpec[] = [
  aboutPage,
  degreePage,
  admissionPage,
  faqPage,
];

/** [페이지 콘텐츠] 메뉴에 나열할 페이지. 입학안내는 전용 메뉴가 있어 제외한다. */
export const contentPages = pageCatalog.filter(
  (page) => page.key !== admissionPage.key,
);

export const ADMISSION_PAGE_KEY = admissionPage.key;

export function findPage(pageKey: string): PageSpec | null {
  return pageCatalog.find((page) => page.key === pageKey) ?? null;
}

export function findSection(
  pageKey: string,
  sectionKey: string,
): { page: PageSpec; section: SectionSpec } | null {
  const page = findPage(pageKey);
  if (!page) return null;

  const section = page.sections.find((item) => item.key === sectionKey);
  return section ? { page, section } : null;
}

/** 카탈로그가 정의한 슬롯만 저장 대상이 된다. (allowlist) */
export function sectionSlots(section: SectionSpec): SectionSlot[] {
  return Object.keys(section.slots) as SectionSlot[];
}

// ---------------------------------------------------------------------------
// 입학안내 수치 (SiteSetting)
// ---------------------------------------------------------------------------

/**
 * 등록금·수수료·개강 시점.
 *
 * 9단계까지 `src/content/program-facts.ts` 에 하드코딩되어 있던 값이며,
 * `CLAUDE.md` 9항("등록금이나 개강일은 하드코딩하지 않는다")에 따라 DB 로 옮긴다.
 *
 * `Program` 이 아니라 `SiteSetting` 에 두는 이유: 수수료·개강월은 과정 공통이라
 * 과정 테이블에 넣으면 같은 값이 두 행에 중복된다. 등록금만 과정별로 나누면
 * 입학안내 수치가 두 화면으로 갈라져 관리가 어려워진다. 한 화면에 모은다.
 *
 * **값이 비어 있으면 화면에 "-" 로 표시한다.** 원본에 금액이 없는 항목(LMS 사용료)이
 * 실제로 있으므로, 비어 있는 상태가 정상적인 값이다. 임의로 채우지 않는다.
 */
export type AdmissionNumberSpec = {
  key: string;
  label: string;
  hint?: string;
  /** 화면에 금액으로 표시되는 값인지 (천단위 구분·원/KRW 표기) */
  currency: boolean;
};

export const admissionNumberSpecs: AdmissionNumberSpec[] = [
  {
    key: "tuition.mba",
    label: "MBA 등록금",
    hint: "숫자만 입력합니다. 예: 3000000",
    currency: true,
  },
  {
    key: "tuition.dba",
    label: "DBA 등록금",
    hint: "숫자만 입력합니다. 예: 3600000",
    currency: true,
  },
  {
    key: "fee.admissionReview",
    label: "입학허가 심사비",
    currency: true,
  },
  {
    key: "fee.lms",
    label: "홈페이지 사용료 (LMS)",
    hint: "원본 자료에 금액이 없어 비어 있습니다. 확정되기 전에는 비워 두세요. 표에 '-' 로 표시됩니다.",
    currency: true,
  },
  {
    key: "fee.administrative",
    label: "행정등록비",
    currency: true,
  },
  {
    key: "intake.year",
    label: "개강 연도",
    hint: "예: 2026",
    currency: false,
  },
  {
    key: "intake.month",
    label: "개강 월",
    hint: "1~12 사이의 숫자입니다. 예: 10",
    currency: false,
  },
  {
    key: "exchangeRate.base",
    label: "등록금 표기 환율 (1달러당 원)",
    hint: "등록금 비고에 적는 환율 기준입니다. 예: 1200",
    currency: false,
  },
];

export const admissionNumberKeys = admissionNumberSpecs.map((spec) => spec.key);
