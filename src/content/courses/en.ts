import type { CourseCatalog } from "./types";

/**
 * 영어 교과목 카탈로그.
 *
 * 과목명은 원본 문서에 기재된 공식 영문명을 그대로 사용한다.
 * 원본에 영문명이 없는 과목(`global-hotel-food-culture`, `world-wineries`)은
 * 영문명을 새로 만들지 않고 한국어 원표기를 그대로 노출한다.
 */
export const coursesEn: CourseCatalog = {
  "global-tourism-structure": {
    key: "global-tourism-structure",
    category: "major",
    title: "Global Structure and Development of the Tourism Industry",
    titleAlt: "글로벌 관광산업의 구조와 전개",
    credits: 3,
    format: "Theory",
    description:
      "Traces how the global tourism industry formed and developed, and builds a structural understanding of the global tourism ecosystem spanning airlines, hotels, festivals and OTAs.",
  },
  "wine-culture-history": {
    key: "wine-culture-history",
    category: "major",
    title: "Global Wine Culture and Historical Development",
    titleAlt: "세계 와인 문화와 역사적 발전",
    credits: 3,
    format: "Theory",
    description:
      "Examines the formation and development of global wine culture through historical cases, and the cultural meaning wine has held across eras and regions.",
  },
  "hospitality-service-systems": {
    key: "hospitality-service-systems",
    category: "major",
    title: "Hospitality Service Systems: Hotels, Resorts, and Foodservice",
    titleAlt: "호텔, 리조트, 외식 서비스 시스템의 이해",
    credits: 3,
    format: "Theory",
    description:
      "Covers the service structures and operating methods of the hotel, resort and foodservice industries, and how each field designs and delivers the guest experience.",
  },
  "wine-brand-destination": {
    key: "wine-brand-destination",
    category: "major",
    title: "Wine Brands and the Mechanism of Destination Formation",
    titleAlt: "와인 브랜드와 관광지 형성의 메카니즘",
    credits: 3,
    format: "Theory",
    description:
      "Looks at how wine brands shape regional image and destination formation, and how wine-producing regions, brands and the tourism industry interact.",
  },
  "global-festivals-events": {
    key: "global-festivals-events",
    category: "major",
    title: "Structural Understanding of Global Festivals and Events",
    titleAlt: "세계 축제와 이벤트의 구조적 이해",
    credits: 3,
    format: "Theory",
    description:
      "Examines how major global festivals and events are planned, operated and scaled, and their impact on regional economies, tourism and culture.",
  },
  "gastronomic-wine-tourism": {
    key: "gastronomic-wine-tourism",
    category: "major",
    title: "Concepts and Applications of Gastronomic Wine Tourism",
    titleAlt: "미식 와인 관광의 개념과 적용",
    credits: 3,
    format: "Theory",
    description:
      "Covers how gastronomy, wine and tourism combine and create value, with real cases of tourism content built on regional food culture and wine.",
  },
  "mice-conventions": {
    key: "mice-conventions",
    category: "major",
    title: "Systematic Understanding of MICE and Conventions",
    titleAlt: "MICE 컨벤션의 체계적 이해",
    credits: 3,
    format: "Theory",
    description:
      "Covers the structure and operation of the MICE industry, and analyses how international conferences, exhibitions and incentive travel affect regional economies and tourism.",
  },
  "sustainable-wine-tourism": {
    key: "sustainable-wine-tourism",
    category: "major",
    title: "Sustainable Tourism and Eco-Friendly Wine",
    titleAlt: "친환경 와인과 지속가능 관광",
    credits: 3,
    format: "Theory",
    description:
      "Examines how eco-friendly wine production connects with sustainable tourism, with strategic cases that protect and develop regional environment, culture and economy.",
  },
  "global-hotel-food-culture": {
    key: "global-hotel-food-culture",
    category: "major",
    // 원본에 영문 과목명이 없어 한국어 원표기를 그대로 사용한다.
    title: "호텔, 외식 문화의 세계적 다양성",
    titleAlt: "",
    credits: null,
    format: "Theory",
    description: null,
  },
  "world-wineries": {
    key: "world-wineries",
    category: "major",
    // 원본에 영문 과목명이 없어 한국어 원표기를 그대로 사용한다.
    title: "전 세계 와이너리의 전통과 이야기",
    titleAlt: "",
    credits: 3,
    format: "Theory",
    description: null,
  },
  "global-travel-trends": {
    key: "global-travel-trends",
    category: "major",
    title: "Global Travel Trends: Flows and Transformations",
    titleAlt: "세계 여행 트랜드의 흐름과 변화",
    credits: 3,
    format: "Theory",
    description:
      "Analyses how global travel trends have shifted and the main drivers behind them, and how new consumption patterns affect the tourism industry.",
    altEnglishTitles: [
      "Global Travel Trends: Flows and Transformations",
      "Global Travel Trends: Flows and Changes",
    ],
  },
  "wine-civilization": {
    key: "wine-civilization",
    category: "major",
    title: "Development of Wine Civilization and Regional Characteristics",
    titleAlt: "와인 문명의 발달과 지역별 특성",
    credits: 3,
    format: "Theory",
    description:
      "Traces how wine civilization formed and developed, and the characteristics produced by the culture, climate and traditions of major wine regions.",
  },
  "global-tourism-culture": {
    key: "global-tourism-culture",
    category: "major",
    title: "In-Depth Understanding of Global Tourism Culture",
    titleAlt: "세계 관광문화의 심층적 이해",
    credits: 3,
    format: "Theory",
    description:
      "Examines the background and characteristics of tourism cultures across world regions, and how culture, society, history and tourism interact.",
  },
  "hotel-resort-culture": {
    key: "hotel-resort-culture",
    category: "major",
    title: "Evolution of Global Hotel and Resort Culture",
    titleAlt: "세계 호텔, 리조트 문화의 진화",
    credits: 3,
    format: "Theory",
    // 원본 소개표의 교과 내용이 다른 과목과 동일하게 기재되어 있어 비워 둔다. (확인 필요)
    description: null,
  },
  "gastronomy-wine-symbolism": {
    key: "gastronomy-wine-symbolism",
    category: "major",
    title: "Global Gastronomy and the Symbolism of Wine",
    titleAlt: "글로벌 미식과 와인의 상징성",
    credits: 3,
    format: "Theory",
    description:
      "Analyses the symbolic meaning of global food culture and wine, and the social and historical value created where food, wine and culture meet.",
  },
  "hospitality-industry": {
    key: "hospitality-industry",
    category: "common",
    title: "Understanding the Hospitality Industry",
    titleAlt: "환대산업의 이해",
    credits: 3,
    format: "Theory",
    description:
      "Covers the structure and operation of the hospitality industry including hotels, resorts, foodservice and travel, and how the industry creates value and service around the guest experience.",
  },
  "tourism-marketing": {
    key: "tourism-marketing",
    category: "common",
    title: "Tourism Marketing",
    titleAlt: "관광마케팅",
    credits: 3,
    format: "Theory",
    description:
      "Covers tourism consumer behaviour and market characteristics, with strategies and cases for promoting destinations, hotels, festivals and travel products.",
  },
  "hotel-consumer-behavior": {
    key: "hotel-consumer-behavior",
    category: "common",
    title: "Hotel Consumer Behavior",
    titleAlt: "호텔소비자행동론",
    credits: 3,
    format: "Theory",
    description:
      "Analyses hotel guests' needs, preferences and decision-making, and how consumer behaviour informs service design, marketing and brand strategy.",
  },
  "foodservice-industry": {
    key: "foodservice-industry",
    category: "common",
    title: "Foodservice Industry Studies",
    titleAlt: "외식산업론",
    credits: 3,
    format: "Theory",
    description:
      "Covers the structure and operating characteristics of the foodservice industry, and how market change, consumption trends and management strategy affect brand growth.",
  },
  "wine-and-food": {
    key: "wine-and-food",
    category: "common",
    title: "Wine and Food",
    titleAlt: "와인과 음식",
    credits: 3,
    format: "Theory",
    description:
      "Covers the principles of pairing wine with food, and how wine pairing is applied across different food cultures through real cases.",
  },
};
