import Image from "next/image";
import type { HomeContent } from "@/content/home";
import { designBImages } from "@/components/site-b/images";
import { BContainer } from "@/components/site-b/BLayout";
import { BEyebrow, BMega } from "@/components/site-b/BType";

/**
 * 100% 온라인.
 *
 * ## 이전 시안이 왜 부족했는가
 *
 * 큰 글자를 왼쪽 7/12 칸에 두고 나머지를 오른쪽에 몰아 놓았더니,
 * 글자 위·아래로 수백 px 의 검은 빈 면이 남았다. 사진도 오른쪽 칸 맨 아래에
 * 작게 붙어 있어 구성에 참여하지 못했다.
 *
 * ## 지금 구조
 *
 * 넓은 화면에서 **네 덩어리가 한 줄로 맞물린다.**
 *
 *   큰 글자(33%) · 제목과 설명(20%) · 사진(29%) · 학기 일정(17%)
 *
 * 네 덩어리가 세로 가운데에서 정렬되므로 위에 빈 면이 생기지 않고,
 * 지면 폭을 끝까지 쓴다. 태블릿에서는 2×2, 모바일에서는 한 줄로 접힌다.
 *
 * 큰 글자는 콘텐츠의 `badge`("100% ONLINE")를 두 조각으로 나눈 것이다.
 * 새 문구를 만들지 않았고, 나눌 수 없는 형태면 통째로 한 줄에 둔다.
 * `ONLINE` 은 `whitespace-nowrap` 이라 어떤 폭에서도 낱말이 쪼개지지 않는다.
 */
export function BOnline({ content }: { content: HomeContent }) {
  const { online } = content;

  // "100% ONLINE" 을 첫 낱말과 나머지로 나눈다. 공백이 없으면 그대로 한 줄이다.
  const spaceAt = online.badge.indexOf(" ");
  const megaFirst =
    spaceAt === -1 ? online.badge : online.badge.slice(0, spaceAt);
  const megaSecond =
    spaceAt === -1 ? undefined : online.badge.slice(spaceAt + 1);

  return (
    <section className="relative overflow-hidden bg-midnight py-16 text-white lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_78%_50%,rgba(168,130,63,0.18),transparent_62%)]"
      />

      <BContainer className="relative">
        <div
          className={
            // 큰 글자 36% / 설명 19% / 사진 28% / 학기 17%.
            // 큰 글자 칸을 조금 넓게 잡은 것은 `ONLINE` 한 낱말이 들어갈 폭이 필요해서다.
            "grid items-center gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1fr_0.6fr] lg:gap-x-12"
          }
        >
          {/* 1. 큰 글자 */}
          <div className="@container">
            <BMega nowrap>{megaFirst}</BMega>
            {megaSecond && (
              <BMega nowrap dim>
                {megaSecond}
              </BMega>
            )}
          </div>

          {/* 2. 제목과 설명 */}
          <div>
            <h2 className="font-serif text-xl leading-snug font-bold text-balance text-white sm:text-2xl">
              {online.title}
            </h2>
            <p className="mt-5 text-[0.9375rem] leading-[1.85] text-white/70">
              {online.description}
            </p>
          </div>

          {/* 3. 사진. 다른 덩어리와 같은 줄에 놓여 구성에 참여한다. */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink">
            <Image
              src={designBImages.online}
              alt=""
              fill
              sizes="(min-width: 1024px) 26rem, (min-width: 640px) 45vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,15,0.10)_0%,rgba(4,8,15,0.45)_100%)]"
            />
          </div>

          {/* 4. 학기 일정 */}
          <div>
            <BEyebrow tone="dark">{online.scheduleTitle}</BEyebrow>
            <ul className="mt-5 border-t border-white/20">
              {online.schedule.map((item) => (
                <li
                  key={item}
                  className="border-b border-white/15 py-3.5 text-[0.875rem] tracking-wide text-white/85"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </BContainer>
    </section>
  );
}
