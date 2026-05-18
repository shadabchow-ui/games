import type { GameCardData, IgdbGame } from "./types";

export function mapIgdbGameToCard(game: IgdbGame): GameCardData {
  return {
    id: game.id,
    name: game.name,
    slug: game.slug,
    coverImageId: game.cover?.image_id ?? null,
    releaseYear: game.first_release_date
      ? new Date(game.first_release_date * 1000).getUTCFullYear()
      : null,
    totalRating: game.total_rating,
    totalRatingCount: game.total_rating_count,
    genres: (game.genres ?? []).map((genre) => genre.name),
    platforms: (game.platforms ?? []).map((platform) => platform.name),
    summary: game.summary ?? null,
  };
}
