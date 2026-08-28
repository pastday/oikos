import { MAX_SEARCH_LENGTH } from "@/lib/admin/inquiry";

/**
 * 관리자 목록 검색 상자.
 *
 * 화면마다 찾는 대상이 달라(상담은 이름·이메일·연락처, 입학신청은 이름·접수번호)
 * 안내 문구만 `placeholder` 로 받는다. 기본값은 상담 목록의 기존 문구다.
 *
 * GET form 이라 제출하면 브라우저가 알아서 쿼리스트링을 만든다.
 * JS 없이도 동작하고, 결과 화면 주소를 그대로 공유할 수 있다.
 *
 * 현재 걸려 있는 필터는 hidden 으로 함께 보내 검색해도 필터가 풀리지 않게 한다.
 * (페이지 번호는 일부러 빼서 검색하면 1페이지부터 보게 한다)
 */
export function SearchBox({
  basePath,
  defaultValue,
  hiddenFields,
  placeholder = "이름, 이메일, 연락처 검색",
}: {
  basePath: string;
  defaultValue: string;
  hiddenFields: Record<string, string | undefined>;
  placeholder?: string;
}) {
  return (
    <form action={basePath} method="get" className="flex flex-wrap gap-2">
      {Object.entries(hiddenFields).map(([name, value]) =>
        value ? (
          <input key={name} type="hidden" name={name} value={value} readOnly />
        ) : null,
      )}

      <label htmlFor="admin-search" className="sr-only">
        {placeholder}
      </label>
      <input
        id="admin-search"
        name="q"
        type="search"
        defaultValue={defaultValue}
        maxLength={MAX_SEARCH_LENGTH}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-md border border-line bg-background px-3.5 py-2 text-sm text-foreground transition-colors placeholder:text-muted/70 focus:border-navy-soft sm:max-w-xs sm:flex-none"
      />

      <button
        type="submit"
        className="rounded-md border border-navy bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-soft"
      >
        검색
      </button>

      {defaultValue && (
        <a
          href={basePath}
          className="inline-flex items-center rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          초기화
        </a>
      )}
    </form>
  );
}
