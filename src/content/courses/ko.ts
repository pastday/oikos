import type { CourseCatalog } from "./types";

/**
 * 한국어 교과목 카탈로그.
 * 과목명·교과 내용은 원본 문서 표기를 그대로 사용한다.
 */
export const coursesKo: CourseCatalog = {
  "global-tourism-structure": {
    key: "global-tourism-structure",
    category: "major",
    title: "글로벌 관광산업의 구조와 전개",
    titleAlt: "Global Structure and Development of the Tourism Industry",
    credits: 3,
    format: "이론",
    description:
      "세계 관광산업의 형성과 발전 과정을 살펴보고, 항공·호텔·축제·OTA 등으로 이어지는 글로벌 관광 생태계를 구조적으로 이해한다.",
  },
  "wine-culture-history": {
    key: "wine-culture-history",
    category: "major",
    title: "세계 와인 문화와 역사적 발전",
    titleAlt: "Global Wine Culture and Historical Development",
    credits: 3,
    format: "이론",
    description:
      "세계 와인 문화의 형성과 발전을 역사적 사례로 살펴보고, 각 시대와 지역에서 와인이 가진 문화적 의미를 이해한다.",
  },
  "hospitality-service-systems": {
    key: "hospitality-service-systems",
    category: "major",
    title: "호텔, 리조트, 외식 서비스 시스템의 이해",
    titleAlt: "Hospitality Service Systems: Hotels, Resorts, and Foodservice",
    credits: 3,
    format: "이론",
    description:
      "호텔·리조트·외식 산업의 서비스 구조와 운영 방식을 이해하고, 각 분야가 고객 경험을 어떻게 설계하고 제공하는지 파악한다.",
  },
  "wine-brand-destination": {
    key: "wine-brand-destination",
    category: "major",
    title: "와인 브랜드와 관광지 형성의 메카니즘",
    titleAlt: "Wine Brands and the Mechanism of Destination Formation",
    credits: 3,
    format: "이론",
    description:
      "와인 브랜드가 지역 이미지와 관광지 형성에 어떤 영향을 미치는지 살펴보고, 와인 생산지·브랜드·관광 산업이 상호작용하는 구조를 이해한다.",
  },
  "global-festivals-events": {
    key: "global-festivals-events",
    category: "major",
    title: "세계 축제와 이벤트의 구조적 이해",
    titleAlt: "Structural Understanding of Global Festivals and Events",
    credits: 3,
    format: "이론",
    description:
      "세계 주요 축제와 이벤트가 어떻게 기획·운영·확장되는지 그 구조와 메커니즘을 살펴보고, 지역 경제·관광·문화 형성에 미치는 영향을 이해한다.",
  },
  "gastronomic-wine-tourism": {
    key: "gastronomic-wine-tourism",
    category: "major",
    title: "미식 와인 관광의 개념과 적용",
    titleAlt: "Concepts and Applications of Gastronomic Wine Tourism",
    credits: 3,
    format: "이론",
    description:
      "미식·와인·관광이 결합되는 방식과 그 가치 창출 구조를 이해하고, 지역 식문화와 와인을 활용한 관광 콘텐츠의 실제 적용 사례를 살펴본다.",
  },
  "mice-conventions": {
    key: "mice-conventions",
    category: "major",
    title: "MICE 컨벤션의 체계적 이해",
    titleAlt: "Systematic Understanding of MICE and Conventions",
    credits: 3,
    format: "이론",
    description:
      "MICE 산업의 구조와 운영 방식을 이해하고, 국제회의·전시·인센티브 관광이 지역 경제와 관광산업에 미치는 영향을 분석한다.",
  },
  "sustainable-wine-tourism": {
    key: "sustainable-wine-tourism",
    category: "major",
    title: "친환경 와인과 지속가능 관광",
    titleAlt: "Sustainable Tourism and Eco-Friendly Wine",
    credits: 3,
    format: "이론",
    description:
      "친환경 와인 생산과 지속가능 관광의 연결 구조를 이해하고, 지역 환경·문화·경제를 보호하며 발전시키는 전략적 사례를 탐구한다.",
  },
  "global-hotel-food-culture": {
    key: "global-hotel-food-culture",
    category: "major",
    title: "호텔, 외식 문화의 세계적 다양성",
    titleAlt: "",
    // 원본 커리큘럼 목록에서 이 과목만 학점 표기가 빠져 있다. 임의로 3학점이라고 적지 않는다.
    credits: null,
    format: "이론",
    // 원본 전공과목 소개표에 이 과목의 교과 내용이 없다.
    description: null,
  },
  "world-wineries": {
    key: "world-wineries",
    category: "major",
    title: "전 세계 와이너리의 전통과 이야기",
    titleAlt: "",
    credits: 3,
    format: "이론",
    // 원본 전공과목 소개표에 이 과목의 교과 내용이 없다.
    description: null,
  },
  "global-travel-trends": {
    key: "global-travel-trends",
    category: "major",
    title: "세계 여행 트랜드의 흐름과 변화",
    titleAlt: "Global Travel Trends: Flows and Transformations",
    credits: 3,
    format: "이론",
    description:
      "세계 여행 트렌드가 어떻게 변화해왔는지 그 흐름과 주요 요인을 분석하고, 새로운 소비 패턴이 관광산업에 미치는 영향을 이해한다.",
    // 원본 문서에 이 과목이 두 번 기재되어 있고 영문명이 서로 다르다.
    altEnglishTitles: [
      "Global Travel Trends: Flows and Transformations",
      "Global Travel Trends: Flows and Changes",
    ],
  },
  "wine-civilization": {
    key: "wine-civilization",
    category: "major",
    title: "와인 문명의 발달과 지역별 특성",
    titleAlt: "Development of Wine Civilization and Regional Characteristics",
    credits: 3,
    format: "이론",
    description:
      "와인 문명이 어떻게 형성·발달했는지를 살펴보고, 주요 지역별 와인의 문화·기후·전통이 만들어낸 특성을 이해한다.",
  },
  "global-tourism-culture": {
    key: "global-tourism-culture",
    category: "major",
    title: "세계 관광문화의 심층적 이해",
    titleAlt: "In-Depth Understanding of Global Tourism Culture",
    credits: 3,
    format: "이론",
    description:
      "세계 각 지역의 관광문화가 형성된 배경과 특성을 살펴보고, 문화·사회·역사·관광이 상호작용하는 구조를 깊이 있게 이해한다.",
  },
  "hotel-resort-culture": {
    key: "hotel-resort-culture",
    category: "major",
    title: "세계 호텔, 리조트 문화의 진화",
    titleAlt: "Evolution of Global Hotel and Resort Culture",
    credits: 3,
    format: "이론",
    // 원본 소개표의 교과 내용이 '세계 관광문화의 심층적 이해' 와 완전히 동일하게 기재되어 있다.
    // 복사 오류로 보이므로 잘못된 설명을 노출하지 않고 비워 둔다. (확인 필요 항목)
    description: null,
  },
  "gastronomy-wine-symbolism": {
    key: "gastronomy-wine-symbolism",
    category: "major",
    title: "글로벌 미식과 와인의 상징성",
    titleAlt: "Global Gastronomy and the Symbolism of Wine",
    credits: 3,
    format: "이론",
    description:
      "세계 미식문화와 와인이 지닌 상징적 의미를 분석하며, 음식·와인·문화가 결합해 만들어내는 사회적·역사적 가치를 이해한다.",
  },
  "hospitality-industry": {
    key: "hospitality-industry",
    category: "common",
    title: "환대산업의 이해",
    titleAlt: "Understanding the Hospitality Industry",
    credits: 3,
    format: "이론",
    description:
      "호텔·리조트·외식·여행을 포함한 환대산업의 구조와 운영 방식을 파악하고, 고객 경험을 중심으로 산업 전반이 어떻게 가치와 서비스를 창출하는지 이해한다.",
  },
  "tourism-marketing": {
    key: "tourism-marketing",
    category: "common",
    title: "관광마케팅",
    titleAlt: "Tourism Marketing",
    credits: 3,
    format: "이론",
    description:
      "관광 소비자의 행동과 시장 특성을 이해하고, 관광지·호텔·축제·여행상품을 효과적으로 홍보하기 위한 전략과 실제 사례를 다룬다.",
  },
  "hotel-consumer-behavior": {
    key: "hotel-consumer-behavior",
    category: "common",
    title: "호텔소비자행동론",
    titleAlt: "Hotel Consumer Behavior",
    credits: 3,
    format: "이론",
    description:
      "호텔 이용객의 욕구·선호·의사결정 과정을 분석하고, 소비자 행동이 서비스 설계·마케팅·브랜드 전략에 어떻게 반영되는지를 이해한다.",
  },
  "foodservice-industry": {
    key: "foodservice-industry",
    category: "common",
    title: "외식산업론",
    titleAlt: "Foodservice Industry Studies",
    credits: 3,
    format: "이론",
    description:
      "외식산업의 구조와 운영 특성을 이해하고, 시장 변화·소비 트렌드·경영 전략이 외식 브랜드 성장에 미치는 영향을 분석한다.",
  },
  "wine-and-food": {
    key: "wine-and-food",
    category: "common",
    title: "와인과 음식",
    titleAlt: "Wine and Food",
    credits: 3,
    format: "이론",
    description:
      "와인과 음식의 조화 원리를 이해하고, 다양한 식문화 속에서 와인 페어링이 어떻게 적용되는지 실제 사례 중심으로 살펴본다.",
  },
};
