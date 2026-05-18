import Link from "next/link";
import type { IgdbGame } from "lib/igdb/types";

function formatDate(timestamp: number | null) {
  if (!timestamp) {
    return "Unknown";
  }

  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRating(value: number | null) {
  if (typeof value !== "number") {
    return "Unrated";
  }

  return `${Math.round(value * 10) / 10}/100`;
}

function formatCount(value: number | null) {
  if (typeof value !== "number") {
    return "No count";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function formatList(values: string[] | undefined, fallback = "Not available") {
  if (!values?.length) {
    return fallback;
  }

  return values.join(", ");
}

function excerpt(summary: string | null) {
  if (!summary) {
    return "Summary not available.";
  }

  return summary.length > 220 ? `${summary.slice(0, 217).trimEnd()}...` : summary;
}

function getCompanyNames(game: IgdbGame) {
  return (game.involved_companies ?? [])
    .map((item) => item.company?.name?.trim())
    .filter((value): value is string => Boolean(value));
}

function Cell({
  title,
  left,
  right,
}: {
  title: string;
  left: string;
  right: string;
}) {
  return (
    <div className="grid gap-3 border-t border-neutral-200 py-4 first:border-t-0 dark:border-neutral-800 md:grid-cols-[180px,1fr,1fr]">
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
        {title}
      </dt>
      <dd className="text-sm text-neutral-800 dark:text-neutral-100">{left}</dd>
      <dd className="text-sm text-neutral-800 dark:text-neutral-100">{right}</dd>
    </div>
  );
}

export function GameCompareTable({
  leftGame,
  rightGame,
}: {
  leftGame: IgdbGame;
  rightGame: IgdbGame;
}) {
  const leftGenres = leftGame.genres?.map((item) => item.name);
  const rightGenres = rightGame.genres?.map((item) => item.name);
  const leftPlatforms = leftGame.platforms?.map((item) => item.name);
  const rightPlatforms = rightGame.platforms?.map((item) => item.name);
  const leftThemes = leftGame.themes?.map((item) => item.name);
  const rightThemes = rightGame.themes?.map((item) => item.name);
  const leftModes = leftGame.game_modes?.map((item) => item.name);
  const rightModes = rightGame.game_modes?.map((item) => item.name);
  const leftCompanies = getCompanyNames(leftGame);
  const rightCompanies = getCompanyNames(rightGame);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-black">
      <div className="mb-5 grid gap-4 md:grid-cols-[180px,1fr,1fr]">
        <div />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">{leftGame.name}</h2>
          {leftGame.slug ? (
            <Link
              className="text-sm text-blue-700 underline-offset-4 hover:underline dark:text-blue-300"
              href={`/game/${leftGame.slug}`}
            >
              Open game page
            </Link>
          ) : null}
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">{rightGame.name}</h2>
          {rightGame.slug ? (
            <Link
              className="text-sm text-blue-700 underline-offset-4 hover:underline dark:text-blue-300"
              href={`/game/${rightGame.slug}`}
            >
              Open game page
            </Link>
          ) : null}
        </div>
      </div>

      <dl>
        <Cell title="Release date" left={formatDate(leftGame.first_release_date)} right={formatDate(rightGame.first_release_date)} />
        <Cell title="Rating" left={formatRating(leftGame.total_rating)} right={formatRating(rightGame.total_rating)} />
        <Cell
          title="Rating count"
          left={formatCount(leftGame.total_rating_count)}
          right={formatCount(rightGame.total_rating_count)}
        />
        <Cell title="Platforms" left={formatList(leftPlatforms)} right={formatList(rightPlatforms)} />
        <Cell title="Genres" left={formatList(leftGenres)} right={formatList(rightGenres)} />
        <Cell title="Themes" left={formatList(leftThemes)} right={formatList(rightThemes)} />
        <Cell title="Game modes" left={formatList(leftModes)} right={formatList(rightModes)} />
        <Cell title="Companies" left={formatList(leftCompanies)} right={formatList(rightCompanies)} />
        <Cell title="Summary" left={excerpt(leftGame.summary)} right={excerpt(rightGame.summary)} />
      </dl>
    </section>
  );
}
