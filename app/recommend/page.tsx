import { GameGrid } from "components/game";
import Link from "next/link";
import {
  getGenres,
  getPlatforms,
  getRuleBasedRecommendations,
  hasIgdbCredentials,
  isIgdbConfigError,
  isIgdbUpstreamError,
} from "lib/igdb/client";
import { mapIgdbGameToCard } from "lib/igdb/mappers";

export const metadata = {
  title: "Recommend",
  description: "Find what to play next with transparent metadata-based recommendations.",
};

type RecommendSearchParams = {
  platform?: string | string[];
  genre?: string | string[];
  mode?: string | string[];
  release?: string | string[];
  rating?: string | string[];
  like?: string | string[];
};

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] ?? "" : "";
}

function sanitizeLikeQuery(value: string | string[] | undefined) {
  return getSingleValue(value).replace(/\s+/g, " ").trim().slice(0, 80);
}

function sanitizeRating(value: string | string[] | undefined) {
  const parsed = Number.parseInt(getSingleValue(value), 10);
  if (!Number.isFinite(parsed)) {
    return 70;
  }

  return Math.min(Math.max(parsed, 0), 100);
}

function sanitizeMode(value: string | string[] | undefined) {
  const raw = getSingleValue(value);
  return raw === "single-player" || raw === "multiplayer" ? raw : "any";
}

function sanitizeRelease(value: string | string[] | undefined) {
  const raw = getSingleValue(value);
  return raw === "released" || raw === "upcoming" ? raw : "any";
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Find what to play next</h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{message}</p>
    </section>
  );
}

export default async function RecommendPage(props: {
  searchParams?: Promise<RecommendSearchParams>;
}) {
  const searchParams = await props.searchParams;

  try {
    const [genres, platforms] = await Promise.all([getGenres(), getPlatforms()]);
    const selectedGenreSlug = getSingleValue(searchParams?.genre);
    const selectedPlatformSlug = getSingleValue(searchParams?.platform);
    const selectedGenre = genres.find((item) => item.slug === selectedGenreSlug) ?? null;
    const selectedPlatform =
      platforms.find((item) => item.slug === selectedPlatformSlug) ?? null;
    const mode = sanitizeMode(searchParams?.mode);
    const release = sanitizeRelease(searchParams?.release);
    const minimumRating = sanitizeRating(searchParams?.rating);
    const likeQuery = sanitizeLikeQuery(searchParams?.like);

    const result = await getRuleBasedRecommendations({
      genreId: selectedGenre?.id ?? null,
      platformId: selectedPlatform?.id ?? null,
      gameModePreference: mode,
      releasePreference: release,
      minimumRating,
      likeQuery,
    });

    const cards = result.games.map(mapIgdbGameToCard);
    const hasActiveFilters = Boolean(
      selectedGenre || selectedPlatform || likeQuery || mode !== "any" || release !== "any",
    );

    return (
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <header className="mb-6 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Find what to play next</h1>
          <p className="max-w-3xl text-sm text-neutral-600 dark:text-neutral-300">
            Filter recommendations by platform, genre, release window, and play style.
            Recommendations are based on IGDB metadata and transparent rule-based matching
            for now.
          </p>
        </header>

        <form
          action="/recommend"
          className="mb-6 grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-black md:grid-cols-2 xl:grid-cols-3"
        >
          <label className="space-y-2 text-sm">
            <span className="font-medium">Platform</span>
            <select
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              defaultValue={selectedPlatformSlug}
              name="platform"
            >
              <option value="">Any platform</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.slug}>
                  {platform.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Genre</span>
            <select
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              defaultValue={selectedGenreSlug}
              name="genre"
            >
              <option value="">Any genre</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.slug}>
                  {genre.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Single-player or multiplayer</span>
            <select
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              defaultValue={mode}
              name="mode"
            >
              <option value="any">Any mode</option>
              <option value="single-player">Single-player</option>
              <option value="multiplayer">Multiplayer</option>
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Released or upcoming</span>
            <select
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              defaultValue={release}
              name="release"
            >
              <option value="any">Any release window</option>
              <option value="released">Released</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Minimum rating</span>
            <input
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              defaultValue={String(minimumRating)}
              max="100"
              min="0"
              name="rating"
              step="1"
              type="number"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Games like</span>
            <input
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              defaultValue={likeQuery}
              name="like"
              placeholder="Hades, Baldur's Gate 3, Mario Kart..."
              type="text"
            />
          </label>

          <div className="flex items-end gap-3 md:col-span-2 xl:col-span-3">
            <button
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
              type="submit"
            >
              Recommend games
            </button>
            <Link
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
              href="/recommend"
            >
              Reset
            </Link>
          </div>
        </form>

        <div className="mb-6 flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="rounded-full border border-neutral-200 px-3 py-1 dark:border-neutral-800">
            Transparent metadata filters
          </span>
          <span className="rounded-full border border-neutral-200 px-3 py-1 dark:border-neutral-800">
            No AI provider required
          </span>
          {result.seedGame ? (
            <span className="rounded-full border border-neutral-200 px-3 py-1 dark:border-neutral-800">
              Seeded from {result.seedGame.name}
            </span>
          ) : null}
        </div>

        {result.unresolvedFilters.length ? (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            Some filters could not be resolved cleanly from IGDB metadata:{" "}
            {result.unresolvedFilters.join(", ")}.
          </div>
        ) : null}

        {!hasIgdbCredentials() ? (
          <div className="mb-6 rounded-xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
            Add `TWITCH_CLIENT_ID` plus `TWITCH_ACCESS_TOKEN` or `TWITCH_CLIENT_SECRET`
            on the server to load live recommendations.
          </div>
        ) : null}

        {hasActiveFilters || cards.length ? (
          <GameGrid
            emptyMessage="No recommendations matched this combination yet. Try a broader platform, genre, or lower rating threshold."
            games={cards}
          />
        ) : null}
      </section>
    );
  } catch (error) {
    if (isIgdbConfigError(error)) {
      return (
        <ErrorState message="IGDB credentials are not configured on the server." />
      );
    }

    if (isIgdbUpstreamError(error)) {
      return <ErrorState message="IGDB is temporarily unavailable for recommendations." />;
    }

    throw error;
  }
}
