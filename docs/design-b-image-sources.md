# 디자인 B안 시안 이미지 출처

> B안(`/ko/design-b`)에 쓰인 **시안용 정적 이미지**의 출처와 라이선스 기록.
> 파일 위치: `public/images/design-b/`
> 코드에서 부르는 곳: `src/components/site-b/images.ts`

---

## 먼저 알아야 할 것

**이 사진들은 오이코스대학교를 찍은 것이 아니다.**

교수에게 B안 시안을 보여줄 때 화면이 비어 보이지 않게 하려고 넣은 **분위기용 이미지**다.
실제 캠퍼스·강의실·교수·학생 사진이 아니므로, 정식 공개 전에는
**학교가 제공한 실제 사진으로 교체하는 것을 전제**로 한다.

교체는 코드 수정 없이 된다. `BFrame` 은 **CMS Media 가 있으면 언제나 그쪽을 쓰고**
여기 있는 정적 이미지는 Media 가 없을 때만 쓰인다.
관리자가 `/admin` 에서 사진을 올려 연결하면 시안 이미지는 저절로 밀려난다.

교수진 자리에는 **사람 사진을 쓰지 않았다.** 모르는 사람이 교수처럼 보이면 안 되기 때문이다.
그 자리는 CSS 로 만든 면과 이니셜을 유지한다. (13단계 지시 12항)

---

## 라이선스

전부 **CC0 1.0 (Public Domain Dedication)** 이다.

- 상업적 사용 가능
- 저작자 표시 **의무 없음**
- 2차 저작·수정 가능 (실제로 잘라내고 WebP 로 변환했다)

출처 사이트는 [StockSnap.io](https://stocksnap.io) 이며,
[Openverse](https://openverse.org) API 로 `license=cc0` 조건으로 검색해 찾았다.
각 이미지의 라이선스 값은 Openverse 응답의 `license` 필드에서 확인했다.

> Unsplash · Pexels 는 API 키가 있어야 접근할 수 있어 이번에는 쓰지 못했다.
> Google 이미지 검색 결과처럼 **출처·라이선스가 불분명한 이미지는 쓰지 않았다.**

---

## 목록

| 파일 | 원본 제목 | StockSnap ID | 라이선스 | 쓰는 곳 |
| --- | --- | --- | --- | --- |
| `hero-campus.webp` | Harbad University | `1D180509DF` | CC0 | 메인 Hero · 대학원 소개 상단 |
| `architecture.webp` | Geometric Architecture | `VX6JNK1WN8` | CC0 | 학위·인증 상단 · 마지막 상담 CTA 배경 |
| `hospitality-hotel.webp` | Modern Room | `HNJJOEYRQG` | CC0 | 전공 영역 — 호텔경영 |
| `foodservice-restaurant.webp` | Restaurant Dining | `CCF37A44AB` | CC0 | 전공 영역 — 외식경영 |
| `wine-vineyard.webp` | Wine Vineyard | `0OMFG21GUB` | CC0 | 전공 영역 — 와인경영 |
| `tourism-city.webp` | Architecture Building | `0GZ83DHBCE` | CC0 | 전공 영역 — 관광 |
| `programs-discussion.webp` | Team Meeting | `JBW2PXDOL6` | CC0 | MBA·DBA 섹션 · 과정 허브 · MBA/DBA 상세 · 입학안내 상단 |
| `online-study.webp` | Laptop Apple | `BUFBDV2NQW` | CC0 | 100% ONLINE 섹션 |

원본 페이지 주소는 `https://stocksnap.io/photo/<ID>` 형식이다.
예: `hero-campus.webp` → https://stocksnap.io/photo/harbad-university-1D180509DF

---

## 가공

원본은 StockSnap CDN 이 제공하는 **가로 960px** 판을 받았다. (그보다 큰 판은 공개되어 있지 않다)

용도에 맞게 자르고 WebP 로 변환했다. (ImageMagick, 품질 78)

| 용도 | 크기 | 비율 |
| --- | --- | --- |
| Hero (세로로 긴 우측 패널) | 720 × 960 | 3:4 |
| 전공 영역 · 세로 프레임 | 768 × 960 | 4:5 |
| 가로 밴드 (MBA·DBA, 온라인) | 960 × 540 | 16:9 |
| CTA 배경 | 960 × 420 | 21:9 |

전체 8장 합계 **약 536KB**. 가장 큰 파일이 112KB 다.
화면에는 `next/image` 로 그리며 Hero 만 `priority`, 나머지는 지연 로딩된다.

> **Hero 해상도는 아쉬운 부분이다.** 원본이 960px 뿐이라 큰 화면에서 조금 부드럽게 보인다.
> 어두운 gradient 가 덮여 있어 시안으로는 문제없지만,
> 정식 공개 전에는 더 큰 실제 사진으로 바꾸는 편이 낫다.

---

## 대체 텍스트

전부 **빈 `alt`** 로 두었다.

이 사진들은 옆에 있는 글이 이미 말하고 있는 내용을 분위기로 거들 뿐이라,
화면 읽기 프로그램이 건너뛰게 하는 편이 정확하다.
사진 자체가 정보를 전하게 되는 경우(예: 인증서 이미지)에는 `BFrame` 의 `staticAlt` 로
설명을 넘긴다.
