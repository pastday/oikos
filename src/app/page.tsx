// 1단계 확인용 임시 페이지.
// 실제 메인 페이지(Hero, 대학원 소개 등)는 4단계에서 구현한다.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <div>
        <p className="text-sm font-medium tracking-widest text-neutral-500 uppercase">
          Oikos University
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          개발환경 구성 완료
        </h1>
      </div>

      <p className="text-neutral-600 dark:text-neutral-400">
        Next.js + TypeScript + Tailwind CSS 초기 구성이 정상 동작 중입니다. 이
        화면은 1단계 확인용 임시 페이지이며, 실제 홈페이지 콘텐츠는 이후
        단계에서 구현합니다.
      </p>

      <ul className="space-y-1 border-t border-neutral-200 pt-6 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
        <li>다음 단계 · 2단계: 로컬 PostgreSQL 설치 및 Prisma 데이터 모델 설계</li>
        <li>운영 도메인 · https://oikos.pastday.co.kr</li>
      </ul>
    </main>
  );
}
