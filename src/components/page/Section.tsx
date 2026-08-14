import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/cn";

/** 상세 페이지의 본문 섹션. 배경만 교차시켜 긴 페이지의 리듬을 만든다. */
export function Section({
  title,
  description,
  tone = "light",
  children,
}: {
  title?: string;
  description?: string;
  tone?: "light" | "surface";
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "border-b border-line py-14 lg:py-20",
        tone === "surface" ? "bg-surface" : "bg-background",
      )}
    >
      <Container>
        {title && (
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl font-bold text-navy">{title}</h2>
            {description && (
              <p className="mt-3 leading-relaxed text-muted">{description}</p>
            )}
          </div>
        )}
        <div className={cn(title && "mt-8 lg:mt-10")}>{children}</div>
      </Container>
    </section>
  );
}

/** 라벨 + 값 형태의 정보를 격자로 보여준다. */
export function FactGrid({
  items,
  columns = 3,
}: {
  items: { label: string; value: string; note?: string }[];
  columns?: 2 | 3 | 4;
}) {
  return (
    <dl
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "lg:grid-cols-4",
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-line bg-background px-5 py-5"
        >
          <dt className="text-xs font-medium tracking-wide text-muted">
            {item.label}
          </dt>
          <dd className="mt-1.5 font-semibold text-navy">{item.value}</dd>
          {item.note && (
            <dd className="mt-1 text-xs text-muted">{item.note}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}

/** 본문 문단 묶음. */
export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="max-w-3xl space-y-4">
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph.slice(0, 24)}
          className="text-[0.9375rem] leading-[1.85] text-foreground/80"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
