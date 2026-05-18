const NOW_SECONDS = Math.floor(Date.now() / 1000);

const GAME_CARD_FIELDS = [
  "id",
  "name",
  "slug",
  "summary",
  "first_release_date",
  "rating",
  "total_rating",
  "total_rating_count",
  "cover.image_id",
  "genres.id",
  "genres.name",
  "genres.slug",
  "platforms.id",
  "platforms.name",
  "platforms.slug",
  "themes.id",
  "themes.name",
  "game_modes.id",
  "game_modes.name",
  "involved_companies.developer",
  "involved_companies.publisher",
  "involved_companies.company.name",
  "involved_companies.company.slug",
  "similar_games.id",
].join(",");

export const GAME_DETAIL_BY_SLUG_QUERY = (slug: string) => `
fields
  id,
  name,
  slug,
  summary,
  storyline,
  first_release_date,
  rating,
  total_rating,
  total_rating_count,
  cover.image_id,
  genres.id,
  genres.name,
  genres.slug,
  platforms.id,
  platforms.name,
  platforms.slug,
  themes.id,
  themes.name,
  game_modes.id,
  game_modes.name,
  involved_companies.developer,
  involved_companies.publisher,
  involved_companies.company.name,
  screenshots.image_id,
  videos.name,
  videos.video_id,
  similar_games.id,
  similar_games.name,
  similar_games.slug,
  similar_games.summary,
  similar_games.first_release_date,
  similar_games.total_rating,
  similar_games.total_rating_count,
  similar_games.cover.image_id,
  similar_games.genres.name,
  similar_games.platforms.name,
  websites.url,
  websites.category,
  external_games.url,
  external_games.category;
where slug = "${slug}" & category = 0;
limit 1;
`;

export const LIST_GENRES_QUERY = `
fields id,name,slug;
where name != null & slug != null;
sort name asc;
limit 200;
`;

export const LIST_PLATFORMS_QUERY = `
fields id,name,slug;
where name != null & slug != null;
sort name asc;
limit 250;
`;

export const FEATURED_COMPANIES_QUERY = `
fields id,name,slug,description,start_date,logo.image_id,websites.url,websites.category;
where slug != null & name != null;
sort start_date desc;
limit 80;
`;

export const FRANCHISES_DIRECTORY_QUERY = `
fields id,name,slug,games.id;
where slug != null & name != null;
sort name asc;
limit 200;
`;

export const buildGenreBySlugQuery = (slug: string) =>
  `fields id,name,slug; where slug = "${slug}"; limit 1;`;

export const buildPlatformBySlugQuery = (slug: string) =>
  `fields id,name,slug; where slug = "${slug}"; limit 1;`;

export const buildCompanyBySlugQuery = (slug: string) =>
  `fields id,name,slug,description,start_date,logo.image_id,websites.url,websites.category; where slug = "${slug}"; limit 1;`;

export const buildFranchiseBySlugQuery = (slug: string) =>
  `fields id,name,slug,games.id; where slug = "${slug}"; limit 1;`;

export const buildCompanyGamesQuery = (
  companyId: number,
  role: "developer" | "publisher",
  limit = 36,
) =>
  `fields game.${GAME_CARD_FIELDS}; where company = ${companyId} & ${role} = true & game != null; sort game.total_rating desc; limit ${limit};`;

export const buildFranchiseGamesQuery = (id: number, limit: number) =>
  `fields ${GAME_CARD_FIELDS}; where franchises = (${id}) & category = 0 & cover != null; sort total_rating desc; limit ${limit};`;

function joinWhere(clauses: Array<string | null | undefined>) {
  return clauses.filter(Boolean).join(" & ");
}

export function buildRankedGamesQuery(options: {
  sort: "rating" | "release-desc" | "release-asc" | "name";
  limit: number;
  genreId?: number | null;
  platformId?: number | null;
  releasedOnly?: boolean;
  upcomingOnly?: boolean;
  requireCover?: boolean;
  minimumRatingCount?: number;
  minimumRating?: number;
  mainGameOnly?: boolean;
}) {
  const where = joinWhere([
    options.mainGameOnly === false ? null : "category = 0",
    options.mainGameOnly === false ? null : "version_parent = null",
    options.requireCover === false ? null : "cover != null",
    options.genreId ? `genres = (${options.genreId})` : null,
    options.platformId ? `platforms = (${options.platformId})` : null,
    options.releasedOnly
      ? `first_release_date != null & first_release_date <= ${NOW_SECONDS}`
      : null,
    options.upcomingOnly
      ? `first_release_date != null & first_release_date > ${NOW_SECONDS}`
      : null,
    typeof options.minimumRatingCount === "number"
      ? `total_rating_count >= ${options.minimumRatingCount}`
      : null,
    typeof options.minimumRating === "number"
      ? `total_rating >= ${options.minimumRating}`
      : null,
  ]);

  const sortClause =
    options.sort === "name"
      ? "sort name asc;"
      : options.sort === "release-asc"
        ? "sort first_release_date asc;"
        : options.sort === "release-desc"
          ? "sort first_release_date desc;"
          : "sort total_rating desc;";

  return `fields ${GAME_CARD_FIELDS}; where ${where}; ${sortClause} limit ${options.limit};`;
}

export const TOP_RATED_GAMES_QUERY = buildRankedGamesQuery({
  sort: "rating",
  releasedOnly: true,
  requireCover: true,
  minimumRatingCount: 40,
  limit: 24,
});

export const RECENTLY_RELEASED_GAMES_QUERY = buildRankedGamesQuery({
  sort: "release-desc",
  releasedOnly: true,
  requireCover: true,
  limit: 24,
});

export const UPCOMING_GAMES_QUERY = buildRankedGamesQuery({
  sort: "release-asc",
  upcomingOnly: true,
  requireCover: true,
  limit: 24,
});

export const buildTopGamesByGenreQuery = (genreId: number) =>
  buildRankedGamesQuery({
    sort: "rating",
    genreId,
    releasedOnly: true,
    requireCover: true,
    minimumRatingCount: 15,
    limit: 24,
  });

export const buildRecentGamesByGenreQuery = (genreId: number) =>
  buildRankedGamesQuery({
    sort: "release-desc",
    genreId,
    releasedOnly: true,
    requireCover: true,
    limit: 24,
  });

export const buildUpcomingGamesByGenreQuery = (genreId: number) =>
  buildRankedGamesQuery({
    sort: "release-asc",
    genreId,
    upcomingOnly: true,
    requireCover: true,
    limit: 24,
  });

export const buildTopGamesByPlatformQuery = (platformId: number) =>
  buildRankedGamesQuery({
    sort: "rating",
    platformId,
    releasedOnly: true,
    requireCover: true,
    minimumRatingCount: 15,
    limit: 24,
  });

export const buildRecentGamesByPlatformQuery = (platformId: number) =>
  buildRankedGamesQuery({
    sort: "release-desc",
    platformId,
    releasedOnly: true,
    requireCover: true,
    limit: 24,
  });

export const buildUpcomingGamesByPlatformQuery = (platformId: number) =>
  buildRankedGamesQuery({
    sort: "release-asc",
    platformId,
    upcomingOnly: true,
    requireCover: true,
    limit: 24,
  });

export const buildGamesDirectoryQuery = (
  sort: "top-rated" | "newest" | "upcoming" | "name",
  limit: number,
) => {
  if (sort === "newest") {
    return buildRankedGamesQuery({
      sort: "release-desc",
      releasedOnly: true,
      requireCover: true,
      limit,
    });
  }

  if (sort === "upcoming") {
    return buildRankedGamesQuery({
      sort: "release-asc",
      upcomingOnly: true,
      requireCover: true,
      limit,
    });
  }

  if (sort === "name") {
    return buildRankedGamesQuery({
      sort: "name",
      releasedOnly: true,
      requireCover: true,
      limit,
    });
  }

  return buildRankedGamesQuery({
    sort: "rating",
    releasedOnly: true,
    requireCover: true,
    minimumRatingCount: 30,
    limit,
  });
};
