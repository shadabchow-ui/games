import { GameCard, GameCover } from "components/game";
import { getGameBySlug, isIgdbConfigError, isIgdbUpstreamError } from "lib/igdb/client";
import { buildIgdbImageUrl } from "lib/igdb/images";
import type {
  GameCardData,
  IgdbExternalLink,
  IgdbGame,
  IgdbInvolvedCompany,
} from "lib/igdb/types";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 300;

function formatReleaseDate(timestamp?: number | null): string | null {
  if (!timestamp) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(timestamp * 1000));
}

function toNames(values?: Array<{ name?: string } | null> | null) {
  return (values ?? [])
    .map((value) => value?.name?.trim())
    .filter((value): value is string => Boolean(value));
}

function toCompanies(
  involvedCompanies?: IgdbInvolvedCompany[] | null,
  role?: "developer" | "publisher",
) {
  const names = (involvedCompanies ?? [])
    .filter((company) => company?.company?.name && (role ? Boolean(company[role]) : true))
    .map((company) => company?.company?.name?.trim())
    .filter((value): value is string => Boolean(value));

  return [...new Set(names)];
}

function toLinks(
  links?: IgdbExternalLink[] | null,
  externalLinks?: IgdbExternalLink[] | null,
) {
  return [...(links ?? []), ...(externalLinks ?? [])]
    .map((entry) => entry?.url?.trim())
    .filter((url): url is string => typeof url === "string" && /^https?:\/\//.test(url))
    .filter((url, index, array) => array.indexOf(url) === index)
    .slice(0, 8);
}

function toSimilarCard(game: IgdbGame | null | undefined): GameCardData | null {
  if (!game) {
    return null;
  }

  return {
    id: game.id,
    name: game.name,
    slug: game.slug ?? null,
    coverImageId: game.cover?.image_id ?? null,
    firstReleaseDate: game.first_release_date ?? null,
    releaseYear: game.first_release_date
      ? new Date(game.first_release_date * 1000).getUTCFullYear()
      : null,
    totalRating: game.total_rating ?? null,
    totalRatingCount: game.total_rating_count ?? null,
    genres: toNames(game.genres),
    platforms: toNames(game.platforms),
    summary: game.summary,
  };
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const game = await getGameBySlug(params.slug);

  if (!game) {
    return {
      title: "Game not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: game.name,
    description: game.summary || game.storyline || `${game.name} on IGDB.`,
    openGraph: game.cover?.image_id
      ? {
          images: [
            {
              url: buildIgdbImageUrl(game.cover.image_id, "cover_big"),
              alt: game.name,
            },
          ],
        }
      : undefined,
  };
}

export default async function GamePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;

  try {
    const game = await getGameBySlug(params.slug);

    if (!game) {
      return notFound();
    }

    const releaseDate = formatReleaseDate(game.first_release_date);
    const releaseYear = game.first_release_date
      ? new Date(game.first_release_date * 1000).getUTCFullYear()
      : null;
    const genres = toNames(game.genres);
    const platforms = toNames(game.platforms);
    const developers = toCompanies(game.involved_companies, "developer");
    const publishers = toCompanies(game.involved_companies, "publisher");
    const screenshots = (game.screenshots ?? [])
      .map((entry) => entry?.image_id ?? null)
      .filter((value): value is string => Boolean(value));
    const videos = (game.videos ?? []).filter(
      (video): video is NonNullable<typeof video> => Boolean(video?.video_id),
    );
    const similarGames = (game.similar_games ?? [])
      .map(toSimilarCard)
      .filter((entry): entry is GameCardData => Boolean(entry))
      .slice(0, 6);
    const externalLinks = toLinks(game.websites, game.external_games);

    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
        <Link
          className="inline-flex text-sm text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-300"
          href="/games"
        >
          Back to games
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="relative aspect-[3/4] max-w-md">
            <GameCover
              className="h-full"
              imageId={game.cover?.image_id ?? null}
              priority
              title={game.name}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                IGDB game
              </p>
              <h1 className="text-4xl font-semibold tracking-tight">{game.name}</h1>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                {releaseDate ? <span>Released {releaseDate}</span> : null}
                {!releaseDate && releaseYear ? <span>{releaseYear}</span> : null}
                {typeof game.total_rating === "number" ? (
                  <span>
                    Rating {Math.round(game.total_rating * 10) / 10}
                    {typeof game.total_rating_count === "number"
                      ? ` (${new Intl.NumberFormat("en-US").format(game.total_rating_count)})`
                      : ""}
                  </span>
                ) : null}
              </div>

              {genres.length ? (
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span
                      className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
                      key={genre}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              ) : null}

              {platforms.length ? (
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Platforms: {platforms.join(" • ")}
                </p>
              ) : null}

              {game.summary ? (
                <p className="max-w-2xl text-base leading-7 text-neutral-700 dark:text-neutral-300">
                  {game.summary}
                </p>
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Summary unavailable for this game.
                </p>
              )}
            </div>

            {game.storyline ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-black">
                <h2 className="mb-2 text-lg font-semibold tracking-tight">Storyline</h2>
                <p className="text-sm leading-7 text-neutral-700 dark:text-neutral-300">
                  {game.storyline}
                </p>
              </div>
            ) : null}

            {developers.length || publishers.length ? (
              <div className="grid gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-black md:grid-cols-2">
                {developers.length ? (
                  <div>
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Developers
                    </h2>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      {developers.join(" • ")}
                    </p>
                  </div>
                ) : null}
                {publishers.length ? (
                  <div>
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Publishers
                    </h2>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      {publishers.join(" • ")}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {screenshots.length ? (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">Screenshots</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {screenshots.map((imageId, index) => (
                <div
                  className="relative aspect-video overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
                  key={`${imageId}-${index}`}
                >
                  <Image
                    alt={`${game.name} screenshot ${index + 1}`}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1280px) 28vw, (min-width: 768px) 42vw, 100vw"
                    src={buildIgdbImageUrl(imageId, "screenshot_big")}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {videos.length ? (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">Videos</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {videos.map((video) => (
                <article
                  className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-black"
                  key={video.video_id}
                >
                  <div className="aspect-video overflow-hidden rounded-lg bg-black">
                    <iframe
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${video.video_id}`}
                      title={video.name || `${game.name} trailer`}
                    />
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {video.name || "Trailer"}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {externalLinks.length ? (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">External Links</h2>
            <div className="flex flex-wrap gap-3">
              {externalLinks.map((url) => (
                <Link
                  className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:border-blue-600 hover:text-black dark:border-neutral-800 dark:text-neutral-300 dark:hover:text-white"
                  href={url}
                  key={url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {new URL(url).hostname.replace(/^www\./, "")}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {similarGames.length ? (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">Similar Games</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {similarGames.map((similarGame) => (
                <GameCard game={similarGame} key={similarGame.id} />
              ))}
            </div>
          </section>
        ) : null}
      </section>
    );
  } catch (error) {
    if (isIgdbConfigError(error)) {
      return (
        <section className="mx-auto w-full max-w-3xl px-4 py-8 text-sm text-neutral-700 dark:text-neutral-300">
          IGDB server credentials are not configured.
        </section>
      );
    }

    if (isIgdbUpstreamError(error)) {
      return (
        <section className="mx-auto w-full max-w-3xl px-4 py-8 text-sm text-neutral-700 dark:text-neutral-300">
          Unable to load this game right now.
        </section>
      );
    }

    throw error;
  }
}
