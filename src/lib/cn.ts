/**
 * 조건부 className 을 합치는 최소 유틸.
 * clsx / tailwind-merge 같은 외부 라이브러리를 추가하지 않기 위해 직접 둔다.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
