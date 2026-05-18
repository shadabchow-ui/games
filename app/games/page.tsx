import { GameGrid } from "components/game/game-grid";
import {
  isIgdbConfigError,
  isIgdbUpstreamError,
  getGamesDirectory,
  sanitizeLimit,
  sanitizeSortMode,
  type GameSortMode,
} from "lib/igdb";
import Link from "next/link";

const sortOptions: Array<{ label: string; value: GameSortMode }> = [
  { label: "Top rated", value: "top-rated" },
  { label: "Newest", value: "newest" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Name", value: "name" },
];

export const metadata = {
  title: "Games",
  description: "Browse the Upcube Games directory.",
};

export const revalidate = 300;

export default async function GamesPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const rawSort =
    typeof searchParams?.sort === "string" ? searchParams.sort : undefined;
  const rawLimit =
    typeof searchParams?.limit === "string" ? searchParams.limit : undefined;

  const sort = sanitizeSortMode(rawSort);
  const limit = sanitizeLimit(rawLimit);

  let games = [] as Awaited<ReturnType<typeof getGamesDirectory>>;
  let errorMessage: string | null = null;

  try {
    games = await getGamesDirectory({ sort, limit });
  } catch (error) {
    if (isIgdbConfigError(error)) {
      errorMessage = "IGDB server credentials are not configured.";
    } else if (isIgdbUpstreamError(error)) {
      errorMessage = "Unable to reach IGDB right now.";
    } else {
      errorMessage = "Failed to load games directory.";
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <header className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Games Directory
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Server-rendered listings from IGDB with safe sort query parameters.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Sort:</span>
          {sortOptions.map((option) => {
            const active = option.value === sort;
            return (
              <Link
                key={option.value}
                href={`/games?sort=${option.value}&limit=${limit}`}
                className={`rounded-full px-3 py-1 text-sm transition ${
                  active
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Filters (coming soon):</span>
          <select
            disabled
            aria-label="Filter by platform"
            className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option>Platform</option>
          </select>
          <select
            disabled
            aria-label="Filter by genre"
            className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option>Genre</option>
          </select>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          Unable to load games: {errorMessage}
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          No games matched this sort. Try{" "}
          <Link className="underline" href="/games?sort=top-rated">
            Top rated
          </Link>
          ,{" "}
          <Link className="underline" href="/games?sort=newest">
            Newest
          </Link>
          , or{" "}
          <Link className="underline" href="/games?sort=upcoming">
            Upcoming
          </Link>
          .
        </div>
      ) : (
        <>
          <GameGrid
            emptyMessage="No games found for this sort mode."
            games={games}
          />
          <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Showing up to {limit} games. Load-more pagination is reserved for a
            follow-up job.
          </div>
        </>
      )}
    </section>
  );
}
