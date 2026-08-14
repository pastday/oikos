import { cn } from "@/lib/cn";

/** 각 섹션의 eyebrow + 제목 + 설명을 통일된 형태로 표시한다. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";

  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "text-xs font-semibold tracking-[0.2em] uppercase",
            isDark ? "text-gold-soft" : "text-gold",
          )}
        >
          {eyebrow}
        </p>
      )}

      <h2
        className={cn(
          "mt-3 font-serif text-2xl font-bold text-balance sm:text-3xl",
          isDark ? "text-white" : "text-navy",
        )}
      >
        {title}
      </h2>

      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed",
            isDark ? "text-white/80" : "text-muted",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
