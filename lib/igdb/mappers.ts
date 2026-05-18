import type { GameCardData, IgdbGame } from "./types";

export function mapIgdbGameToCard(game: IgdbGame): GameCardData {
  return {
    id: game.id,
    name: game.name,
    slug: game.slug ?? null,
    coverImageId: game.cover?.image_id ?? null,
    firstReleaseDate: game.first_release_date ?? null,
    releaseYear: game.first_release_date
      ? new Date(game.first_release_date * 1000).getUTCFullYear()
      : null,
    totalRating: game.total_rating ?? game.rating ?? null,
    totalRatingCount: game.total_rating_count ?? null,
    genres: (game.genres ?? []).map((genre) => genre.name),
    platforms: (game.platforms ?? []).map((platform) => platform.name),
    summary: game.summary ?? null,
  };
}
