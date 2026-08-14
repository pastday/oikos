import { Container } from "./Container";

/**
 * 3단계에서 만든 페이지 골격.
 * 제목과 개발용 안내만 표시하며, 실제 콘텐츠는 이후 단계에서 DB 연동으로 채운다.
 * 확인되지 않은 학교 정보를 임의로 만들어 넣지 않는다.
 */
export function PagePlaceholder({
  title,
  placeholder,
  devNotice,
}: {
  title: string;
  placeholder: string;
  devNotice: string;
}) {
  return (
    <>
      <div className="border-b border-line bg-navy-tint">
        <Container className="py-12 lg:py-16">
          <h1 className="font-serif text-3xl font-bold text-navy lg:text-4xl">
            {title}
          </h1>
          <span
            aria-hidden="true"
            className="mt-4 block h-0.5 w-14 rounded-full bg-gold"
          />
        </Container>
      </div>

      <Container className="py-14 lg:py-20">
        <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center">
          <p className="text-base text-foreground/70">{placeholder}</p>
          <p className="mt-2 text-sm text-muted">{devNotice}</p>
        </div>
      </Container>
    </>
  );
}
