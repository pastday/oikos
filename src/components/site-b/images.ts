/**
 * B안 시안용 정적 이미지.
 *
 * ## Media CMS 와 무엇이 다른가
 *
 * 여기 있는 것은 **교수에게 보여줄 시안을 완성하기 위한 임시 이미지**다.
 * 저장소에 함께 커밋되는 static asset 이며 `public/images/design-b/` 에 있다.
 *
 * 관리자가 올리는 실제 운영 파일은 저장소 **바깥**(`oikos-data/uploads`)에 있고
 * `Media` 테이블이 관리한다. 두 가지를 섞지 않는다.
 * 이 파일 때문에 `Media` 에 행이 생기지 않고, DB 도 건드리지 않는다.
 *
 * ## 실제 사진이 들어오면
 *
 * `BFrame` 은 **CMS Media 가 있으면 언제나 그쪽을 쓴다.** 여기 값은 없을 때만 쓰인다.
 * 그래서 관리자가 사진을 올리는 순간 시안 이미지는 저절로 밀려난다.
 * 코드를 고칠 필요가 없다.
 *
 * ## 이 사진들은 오이코스대학교를 찍은 것이 아니다
 *
 * 전부 CC0(저작자 표시 불필요, 상업적 사용 가능) 무료 이미지이며 **분위기 전달용**이다.
 * 실제 캠퍼스·교수·학생 사진이 아니므로, 정식 공개 전에는 학교가 제공한 실제 사진으로
 * 바꾸는 것을 전제로 한다. 출처는 `docs/design-b-image-sources.md` 에 적어 두었다.
 *
 * 사람 얼굴이 크게 드러나는 사진은 **교수진 자리에 쓰지 않는다.**
 * 모르는 사람이 교수처럼 보이면 안 되기 때문이다. (그 자리는 CSS 로 만든 면을 유지한다)
 */

const BASE = "/images/design-b";

export const designBImages = {
  /** 메인 Hero. 화면 전체를 덮는 가로 판 (960×540, 원본 해상도 그대로 자른 것) */
  heroCampusWide: `${BASE}/hero-campus-wide.webp`,
  /** 같은 사진의 세로 판. 상세 페이지 상단처럼 세로로 긴 자리에 쓴다 */
  heroCampus: `${BASE}/hero-campus.webp`,
  /** 기하학적 건축. 사람이 없어 어느 페이지에나 무난하다 */
  architecture: `${BASE}/architecture.webp`,
  /** 호텔경영 */
  hotel: `${BASE}/hospitality-hotel.webp`,
  /** 외식경영 */
  foodservice: `${BASE}/foodservice-restaurant.webp`,
  /** 와인경영 */
  wine: `${BASE}/wine-vineyard.webp`,
  /** 관광 */
  tourism: `${BASE}/tourism-city.webp`,
  /** MBA·DBA. 회의 장면이며 얼굴이 크게 잡히지 않는다 */
  programs: `${BASE}/programs-discussion.webp`,
  /** 온라인 학습 */
  online: `${BASE}/online-study.webp`,
} as const;

/**
 * 전공 네 영역의 이미지. 콘텐츠의 `pillar.key` 와 1:1 로 대응한다.
 * 키가 늘면 여기서 컴파일 오류가 나므로 빠뜨릴 수 없다.
 */
export const pillarImages: Record<
  "hotel" | "foodservice" | "wine" | "tourism",
  string
> = {
  hotel: designBImages.hotel,
  foodservice: designBImages.foodservice,
  wine: designBImages.wine,
  tourism: designBImages.tourism,
};
