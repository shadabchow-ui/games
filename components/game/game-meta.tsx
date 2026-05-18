import clsx from "clsx";

type GameMetaProps = {
  title: string;
  releaseYear?: number | null;
  totalRating?: number | null;
  totalRatingCount?: number | null;
  genres?: string[];
  platforms?: string[];
  summary?: string | null;
  className?: string;
};

function formatRating(value: number) {
  return `${Math.round(value * 10) / 10}`;
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function GameMeta({
  title,
  releaseYear,
  totalRating,
  totalRatingCount,
  genres = [],
  platforms = [],
  summary,
  className,
}: GameMetaProps) {
  return (
    <div className={clsx("space-y-3", className)}>
      <div className="space-y-1">
        <h3 className="line-clamp-2 text-base font-semibold tracking-tight">
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          {releaseYear ? <span>{releaseYear}</span> : null}
          {totalRating ? (
            <span>
              {formatRating(totalRating)}
              {totalRatingCount ? ` (${formatCount(totalRatingCount)})` : ""}
            </span>
          ) : null}
        </div>
      </div>

      {genres.length ? (
        <div className="flex flex-wrap gap-1.5">
          {genres.slice(0, 3).map((genre) => (
            <span
              className="rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"
              key={genre}
            >
              {genre}
            </span>
          ))}
        </div>
      ) : null}

      {platforms.length ? (
        <p className="line-clamp-1 text-xs text-neutral-600 dark:text-neutral-400">
          {platforms.slice(0, 3).join(" • ")}
        </p>
      ) : null}

      {summary ? (
        <p className="line-clamp-3 text-sm text-neutral-700 dark:text-neutral-300">
          {summary}
        </p>
      ) : null}
    </div>
  );
}
