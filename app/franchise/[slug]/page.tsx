import { GameGrid } from "components/game";
import {
  getFranchiseBySlug,
  getFranchiseGames,
  sanitizeFranchiseSlug,
} from "lib/igdb";
import type { GameCardData, IgdbGame } from "lib/igdb/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 900;

function toGameCard(game: IgdbGame): GameCardData {
  const firstReleaseDate = game.first_release_date ?? null;

  return {
    id: game.id,
    name: game.name,
    slug: game.slug,
    coverImageId: game.cover?.image_id ?? null,
    firstReleaseDate,
    releaseYear: firstReleaseDate
      ? new Date(firstReleaseDate * 1000).getUTCFullYear()
      : null,
    totalRating: game.total_rating,
    totalRatingCount: game.total_rating_count,
    genres: (game.genres ?? []).map((genre) => genre.name),
    platforms: (game.platforms ?? []).map((platform) => platform.name),
    summary: game.summary,
  };
}

function releaseLabel(timestamp?: number | null) {
  if (!timestamp) {
    return "Release date unavailable";
  }
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const safeSlug = sanitizeFranchiseSlug(slug);
  if (!safeSlug) {
    return {
      title: "Franchise",
      description: "Franchise not found.",
    };
  }

  const franchise = await getFranchiseBySlug(safeSlug);
  if (!franchise) {
    return {
      title: "Franchise",
      description: "Franchise not found.",
    };
  }

  return {
    title: franchise.name,
    description: `Browse games in the ${franchise.name} franchise.`,
  };
}

export default async function FranchiseDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const safeSlug = sanitizeFranchiseSlug(slug);
  if (!safeSlug) {
    return notFound();
  }

  let franchise: Awaited<ReturnType<typeof getFranchiseBySlug>> | null = null;
  let games = [] as IgdbGame[];
  let errorMessage: string | null = null;

  try {
    franchise = await getFranchiseBySlug(safeSlug);
    if (!franchise) {
      return notFound();
    }
    games = await getFranchiseGames(franchise.id, 180);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to load franchise details.";
  }

  if (!franchise) {
    return notFound();
  }

  const topRated = [...games]
    .filter((game) => typeof game.total_rating === "number")
    .sort((a, b) => (b.total_rating ?? 0) - (a.total_rating ?? 0))
    .slice(0, 8);

  const timelineGames = games
    .filter((game) => typeof game.first_release_date === "number")
    .sort((a, b) => (a.first_release_date ?? 0) - (b.first_release_date ?? 0));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <header className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{franchise.name}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Franchise games, top-rated titles, and release timeline from IGDB.
        </p>
      </header>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          Unable to load franchise details: {errorMessage}
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          No games found for this franchise.
        </div>
      ) : (
        <div className="space-y-10">
          <div>
            <h2 className="mb-4 text-xl font-semibold tracking-tight">
              Franchise Games
            </h2>
            <GameGrid
              games={games.map(toGameCard)}
              emptyMessage="No games found for this franchise."
            />
          </div>

          {topRated.length ? (
            <div>
              <h2 className="mb-4 text-xl font-semibold tracking-tight">
                Top Rated Entries
              </h2>
              <GameGrid
                games={topRated.map(toGameCard)}
                emptyMessage="No top-rated franchise games available."
              />
            </div>
          ) : null}

          <div>
            <h2 className="mb-4 text-xl font-semibold tracking-tight">
              Release Timeline
            </h2>
            {timelineGames.length ? (
              <ol className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-black">
                {timelineGames.map((game) => (
                  <li
                    key={`${game.id}-timeline`}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2 last:border-b-0 last:pb-0 dark:border-neutral-800"
                  >
                    <span className="font-medium">{game.name}</span>
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">
                      {releaseLabel(game.first_release_date)}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                No release timeline data is available for this franchise.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
