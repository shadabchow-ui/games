import { GameCompareTable } from "components/compare/game-compare-table";
import { isIgdbConfigError, resolveGameReferenceResult } from "lib/igdb/client";
import type { GameLookupResult } from "lib/igdb/types";
import Link from "next/link";

export const metadata = {
  title: "Compare",
  description: "Compare two games side by side with structured IGDB metadata.",
};

type CompareSearchParams = {
  a?: string | string[];
  b?: string | string[];
  gameA?: string | string[];
  gameB?: string | string[];
};

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string"
    ? value
    : Array.isArray(value)
      ? (value[0] ?? "")
      : "";
}

function normalizeCompareQuery(value: string | string[] | undefined) {
  return getSingleValue(value).replace(/\s+/g, " ").trim().slice(0, 80);
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Compare games</h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
        {message}
      </p>
    </section>
  );
}

function LookupStateCard({
  title,
  result,
}: {
  title: string;
  result: GameLookupResult;
}) {
  return (
    <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
        {title}
      </p>
      {result.status === "found" && result.game ? (
        <div className="mt-3 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">
            {result.game.name}
          </h2>
          {result.game.slug ? (
            <Link
              className="text-sm text-blue-700 underline-offset-4 hover:underline dark:text-blue-300"
              href={`/game/${result.game.slug}`}
            >
              Open game page
            </Link>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
          {result.message}
        </p>
      )}
    </article>
  );
}

export default async function ComparePage(props: {
  searchParams?: Promise<CompareSearchParams>;
}) {
  const searchParams = await props.searchParams;
  const leftQuery =
    normalizeCompareQuery(searchParams?.a) ||
    normalizeCompareQuery(searchParams?.gameA);
  const rightQuery =
    normalizeCompareQuery(searchParams?.b) ||
    normalizeCompareQuery(searchParams?.gameB);

  try {
    const [leftResult, rightResult] =
      leftQuery && rightQuery
        ? [
            await resolveGameReferenceResult(leftQuery),
            await resolveGameReferenceResult(rightQuery),
          ]
        : [
            {
              query: leftQuery,
              status: "not_found" as const,
              game: null,
              message: "Enter a game title, slug, or IGDB id.",
            },
            {
              query: rightQuery,
              status: "not_found" as const,
              game: null,
              message: "Enter a game title, slug, or IGDB id.",
            },
          ];

    const leftGame = leftResult.game;
    const rightGame = rightResult.game;
    const bothResolved =
      leftResult.status === "found" && rightResult.status === "found";
    const hasScopedLookupIssue =
      leftResult.status !== "found" || rightResult.status !== "found";

    return (
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <header className="mb-6 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Compare games
          </h1>
          <p className="max-w-3xl text-sm text-neutral-600 dark:text-neutral-300">
            Compare two games with release timing, ratings, platforms, genres,
            themes, game modes, companies, and summary excerpts pulled from
            IGDB.
          </p>
        </header>

        <form
          action="/compare"
          className="mb-6 grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-black md:grid-cols-2"
        >
          <label className="space-y-2 text-sm">
            <span className="font-medium">Game A</span>
            <input
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              defaultValue={leftQuery}
              name="a"
              placeholder="Elden Ring"
              type="text"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Game B</span>
            <input
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              defaultValue={rightQuery}
              name="b"
              placeholder="Baldur's Gate 3"
              type="text"
            />
          </label>
          <div className="flex gap-3 md:col-span-2">
            <button
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
              type="submit"
            >
              Compare
            </button>
            <Link
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
              href="/compare"
            >
              Reset
            </Link>
          </div>
        </form>

        {!leftQuery || !rightQuery ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
            Enter two game titles, slugs, or IGDB ids to compare them side by
            side.
          </div>
        ) : bothResolved && leftGame && rightGame ? (
          <GameCompareTable leftGame={leftGame} rightGame={rightGame} />
        ) : (
          <div className="space-y-4">
            {hasScopedLookupIssue ? (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                Compare stayed available, but one or both lookups did not fully
                resolve.
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <LookupStateCard result={leftResult} title="Game A" />
              <LookupStateCard result={rightResult} title="Game B" />
            </div>
          </div>
        )}
      </section>
    );
  } catch (error) {
    if (isIgdbConfigError(error)) {
      return (
        <ErrorState message="IGDB credentials are not configured on the server." />
      );
    }

    throw error;
  }
}
