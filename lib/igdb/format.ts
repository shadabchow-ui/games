import type { GameCardData, IgdbGame } from "./types";

export function escapeIgdbString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').trim();
}

export function sanitizeGameSlug(value: string): string | null {
  const slug = value.trim().toLowerCase();
  return /^[a-z0-9-]+$/.test(slug) ? slug : null;
}

export function toGameCardData(game: IgdbGame): GameCardData {
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
    totalRating: game.total_rating ?? game.rating ?? null,
    totalRatingCount: game.total_rating_count ?? null,
    genres: (game.genres ?? []).map((genre) => genre.name),
    platforms: (game.platforms ?? []).map((platform) => platform.name),
    summary: game.summary ?? null,
  };
}
