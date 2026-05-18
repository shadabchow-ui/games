export const TOP_RATED_GAMES_QUERY = `
fields id,name,slug,summary,first_release_date,rating,total_rating,total_rating_count,cover.image_id,genres.name,platforms.name;
where category = 0;
sort total_rating desc;
limit 24;
`;

export const RECENTLY_RELEASED_GAMES_QUERY = `
fields id,name,slug,summary,first_release_date,rating,total_rating,total_rating_count,cover.image_id,genres.name,platforms.name;
where category = 0;
sort first_release_date desc;
limit 24;
`;

export const UPCOMING_GAMES_QUERY = `
fields id,name,slug,summary,first_release_date,rating,total_rating,total_rating_count,cover.image_id,genres.name,platforms.name;
where category = 0 & first_release_date > ${Math.floor(Date.now() / 1000)};
sort first_release_date asc;
limit 24;
`;

export const buildUpcomingGamesQuery = () => `
fields id,name,slug,summary,first_release_date,rating,total_rating,total_rating_count,cover.image_id,genres.name,platforms.name;
where category = 0 & first_release_date > ${Math.floor(Date.now() / 1000)};
sort first_release_date asc;
limit 24;
`;

export const LIST_GENRES_QUERY = `fields id,name,slug; sort name asc; limit 200;`;
export const LIST_PLATFORMS_QUERY = `fields id,name,slug; sort name asc; limit 200;`;

export const buildGenreBySlugQuery = (slug: string) =>
  `fields id,name,slug; where slug = "${slug}"; limit 1;`;
export const buildPlatformBySlugQuery = (slug: string) =>
  `fields id,name,slug; where slug = "${slug}"; limit 1;`;

export const buildTopGamesByGenreQuery = (genreId: number) =>
  `fields id,name,slug,summary,first_release_date,rating,total_rating,total_rating_count,cover.image_id,genres.name,platforms.name; where category = 0 & genres = (${genreId}); sort total_rating desc; limit 24;`;
export const buildRecentGamesByGenreQuery = (genreId: number) =>
  `fields id,name,slug,summary,first_release_date,rating,total_rating,total_rating_count,cover.image_id,genres.name,platforms.name; where category = 0 & genres = (${genreId}); sort first_release_date desc; limit 24;`;
export const buildUpcomingGamesByGenreQuery = (genreId: number) =>
  `fields id,name,slug,summary,first_release_date,rating,total_rating,total_rating_count,cover.image_id,genres.name,platforms.name; where category = 0 & genres = (${genreId}) & first_release_date > ${Math.floor(Date.now()/1000)}; sort first_release_date asc; limit 24;`;

export const buildTopGamesByPlatformQuery = (platformId: number) =>
  `fields id,name,slug,summary,first_release_date,rating,total_rating,total_rating_count,cover.image_id,genres.name,platforms.name; where category = 0 & platforms = (${platformId}); sort total_rating desc; limit 24;`;
export const buildRecentGamesByPlatformQuery = (platformId: number) =>
  `fields id,name,slug,summary,first_release_date,rating,total_rating,total_rating_count,cover.image_id,genres.name,platforms.name; where category = 0 & platforms = (${platformId}); sort first_release_date desc; limit 24;`;
export const buildUpcomingGamesByPlatformQuery = (platformId: number) =>
  `fields id,name,slug,summary,first_release_date,rating,total_rating,total_rating_count,cover.image_id,genres.name,platforms.name; where category = 0 & platforms = (${platformId}) & first_release_date > ${Math.floor(Date.now()/1000)}; sort first_release_date asc; limit 24;`;

export const buildGamesDirectoryQuery = (
  sort: "top-rated" | "newest" | "upcoming" | "name",
  limit: number,
) => {
  const whereClause =
    sort === "upcoming"
      ? `where category = 0 & first_release_date > ${Math.floor(Date.now() / 1000)};`
      : "where category = 0;";
  const sortClause =
    sort === "newest"
      ? "sort first_release_date desc;"
      : sort === "upcoming"
        ? "sort first_release_date asc;"
        : sort === "name"
          ? "sort name asc;"
          : "sort total_rating desc;";

  return `fields id,name,slug,summary,first_release_date,rating,total_rating,total_rating_count,cover.image_id,genres.name,platforms.name; ${whereClause} ${sortClause} limit ${limit};`;
};

export const FRANCHISES_DIRECTORY_QUERY = `fields id,name,slug,games.id; where slug != null; sort name asc; limit 200;`;
export const buildFranchiseBySlugQuery = (slug: string) =>
  `fields id,name,slug,games.id; where slug = "${slug}"; limit 1;`;
export const buildFranchiseGamesQuery = (id: number, limit: number) =>
  `fields id,name,slug,summary,first_release_date,rating,total_rating,total_rating_count,cover.image_id,genres.name,platforms.name; where franchises = (${id}); sort total_rating desc; limit ${limit};`;

export const FEATURED_COMPANIES_QUERY = `fields id,name,slug,description,start_date,logo.image_id,websites.url,websites.category; where slug != null & name != null; sort start_date desc; limit 60;`;
export const buildCompanyBySlugQuery = (slug: string) =>
  `fields id,name,slug,description,start_date,logo.image_id,websites.url,websites.category; where slug = "${slug}"; limit 1;`;
export const buildCompanyGamesQuery = (
  companyId: number,
  role: "developer" | "publisher",
) =>
  `fields game.id,game.name,game.slug,game.summary,game.first_release_date,game.rating,game.total_rating,game.total_rating_count,game.cover.image_id,game.genres.name,game.platforms.name; where company = ${companyId} & ${role} = true & game != null; sort game.total_rating desc; limit 24;`;

export const GAME_DETAIL_BY_SLUG_QUERY = (slug: string) => `
fields
  id,
  name,
  slug,
  summary,
  storyline,
  first_release_date,
  total_rating,
  total_rating_count,
  cover.image_id,
  genres.name,
  platforms.name,
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
