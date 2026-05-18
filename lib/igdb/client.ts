import "server-only";

import type {
  DirectoryItem,
  GameCardData,
  GameSortMode,
  IgdbApiErrorResponse,
  IgdbCompany,
  IgdbGame,
  IgdbRequestOptions,
  TwitchTokenResponse,
} from "./types";
import {
  buildCompanyBySlugQuery,
  buildCompanyGamesQuery,
  buildFranchiseBySlugQuery,
  buildFranchiseGamesQuery,
  buildGamesDirectoryQuery,
  buildGenreBySlugQuery,
  buildPlatformBySlugQuery,
  buildRecentGamesByGenreQuery,
  buildRecentGamesByPlatformQuery,
  buildTopGamesByGenreQuery,
  buildTopGamesByPlatformQuery,
  buildUpcomingGamesByGenreQuery,
  buildUpcomingGamesByPlatformQuery,
  FEATURED_COMPANIES_QUERY,
  FRANCHISES_DIRECTORY_QUERY,
  GAME_DETAIL_BY_SLUG_QUERY,
  LIST_GENRES_QUERY,
  LIST_PLATFORMS_QUERY,
  RECENTLY_RELEASED_GAMES_QUERY,
  TOP_RATED_GAMES_QUERY,
  UPCOMING_GAMES_QUERY,
} from "./queries";

class IgdbConfigError extends Error {}
class IgdbUpstreamError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const IGDB_BASE = process.env.IGDB_BASE_URL || "https://api.igdb.com/v4";
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
let tokenCache: { token: string; expiresAt: number } | null = null;

export const hasIgdbCredentials = () =>
  Boolean(
    (process.env.IGDB_CLIENT_ID || process.env.TWITCH_CLIENT_ID) &&
      (process.env.IGDB_ACCESS_TOKEN ||
        process.env.TWITCH_ACCESS_TOKEN ||
        process.env.TWITCH_CLIENT_SECRET),
  );

const escapeIgdbString = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const sanitizeText = (value: string) =>
  value.replace(/\s+/g, " ").trim().slice(0, 80);

async function getToken() {
  if (process.env.IGDB_ACCESS_TOKEN) {
    return process.env.IGDB_ACCESS_TOKEN;
  }

  if (process.env.TWITCH_ACCESS_TOKEN) {
    return process.env.TWITCH_ACCESS_TOKEN;
  }

  const clientId = process.env.IGDB_CLIENT_ID || process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new IgdbConfigError("IGDB credentials are not configured.");
  }

  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token;
  }

  const response = await fetch(TWITCH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new IgdbUpstreamError("Unable to authenticate with Twitch", response.status);
  }

  const json = (await response.json()) as TwitchTokenResponse;
  tokenCache = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };

  return json.access_token;
}

export async function igdbPost<T>({
  endpoint,
  query,
}: IgdbRequestOptions): Promise<T[]> {
  const clientId = process.env.IGDB_CLIENT_ID || process.env.TWITCH_CLIENT_ID;
  if (!clientId) {
    throw new IgdbConfigError("IGDB credentials are not configured.");
  }

  const token = await getToken();
  const response = await fetch(
    new URL(endpoint.replace(/^\/+/, ""), `${IGDB_BASE}/`),
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "text/plain",
      },
      body: query.trim(),
    },
  );

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | IgdbApiErrorResponse
      | null;
    throw new IgdbUpstreamError(
      errorBody?.title || "IGDB request failed",
      errorBody?.status || response.status,
    );
  }

  return (await response.json()) as T[];
}

export async function igdbRequest<T>(
  endpoint: string,
  query: string,
): Promise<T[]> {
  return igdbPost<T>({ endpoint, query });
}

const toCard = (game: IgdbGame): GameCardData => ({
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
  genres: (game.genres ?? []).map((genre) => genre.name),
  platforms: (game.platforms ?? []).map((platform) => platform.name),
  summary: game.summary ?? null,
});

export const getTopRatedGames = async () =>
  (await igdbPost<IgdbGame>({ endpoint: "games", query: TOP_RATED_GAMES_QUERY })).map(
    toCard,
  );

export const getRecentlyReleasedGames = async () =>
  (
    await igdbPost<IgdbGame>({
      endpoint: "games",
      query: RECENTLY_RELEASED_GAMES_QUERY,
    })
  ).map(toCard);

export const getUpcomingGames = async () =>
  (await igdbPost<IgdbGame>({ endpoint: "games", query: UPCOMING_GAMES_QUERY })).map(
    toCard,
  );

export const getTopRatedGameCards = getTopRatedGames;
export const getRecentlyReleasedGameCards = getRecentlyReleasedGames;
export const getUpcomingGameCards = getUpcomingGames;

export const getGamesDirectory = async ({
  sort,
  limit,
}: {
  sort: GameSortMode;
  limit: number;
}) =>
  (
    await igdbPost<IgdbGame>({
      endpoint: "games",
      query: buildGamesDirectoryQuery(sort, limit),
    })
  ).map(toCard);

export const getGenres = () =>
  igdbPost<DirectoryItem>({ endpoint: "genres", query: LIST_GENRES_QUERY });

export const getPlatforms = () =>
  igdbPost<DirectoryItem>({ endpoint: "platforms", query: LIST_PLATFORMS_QUERY });

export const getGenreBySlug = async (slug: string) =>
  (
    await igdbPost<DirectoryItem>({
      endpoint: "genres",
      query: buildGenreBySlugQuery(escapeIgdbString(slug)),
    })
  )[0] ?? null;

export const getPlatformBySlug = async (slug: string) =>
  (
    await igdbPost<DirectoryItem>({
      endpoint: "platforms",
      query: buildPlatformBySlugQuery(escapeIgdbString(slug)),
    })
  )[0] ?? null;

const getRawGames = (query: string) => igdbPost<IgdbGame>({ endpoint: "games", query });

export const getTopGamesByGenre = (id: number) => getRawGames(buildTopGamesByGenreQuery(id));
export const getRecentGamesByGenre = (id: number) =>
  getRawGames(buildRecentGamesByGenreQuery(id));
export const getUpcomingGamesByGenre = (id: number) =>
  getRawGames(buildUpcomingGamesByGenreQuery(id));
export const getTopGamesByPlatform = (id: number) =>
  getRawGames(buildTopGamesByPlatformQuery(id));
export const getRecentGamesByPlatform = (id: number) =>
  getRawGames(buildRecentGamesByPlatformQuery(id));
export const getUpcomingGamesByPlatform = (id: number) =>
  getRawGames(buildUpcomingGamesByPlatformQuery(id));

export const getFeaturedCompanies = () =>
  igdbPost<IgdbCompany>({ endpoint: "companies", query: FEATURED_COMPANIES_QUERY });

export const getCompanyBySlug = async (slug: string) =>
  (
    await igdbPost<IgdbCompany>({
      endpoint: "companies",
      query: buildCompanyBySlugQuery(escapeIgdbString(slug)),
    })
  )[0] ?? null;

export const getCompanyDevelopedGames = (id: number) =>
  igdbPost<{ game: IgdbGame | null }>({
    endpoint: "involved_companies",
    query: buildCompanyGamesQuery(id, "developer"),
  }).then((rows) =>
    rows.map((row) => row.game).filter((game): game is IgdbGame => Boolean(game)),
  );

export const getCompanyPublishedGames = (id: number) =>
  igdbPost<{ game: IgdbGame | null }>({
    endpoint: "involved_companies",
    query: buildCompanyGamesQuery(id, "publisher"),
  }).then((rows) =>
    rows.map((row) => row.game).filter((game): game is IgdbGame => Boolean(game)),
  );

export const getFranchisesDirectory = (limit = 90) =>
  igdbPost<DirectoryItem>({
    endpoint: "franchises",
    query: FRANCHISES_DIRECTORY_QUERY.replace(
      "limit 200;",
      `limit ${Math.min(Math.max(limit, 1), 200)};`,
    ),
  });

export const getFranchiseBySlug = async (slug: string) =>
  (
    await igdbPost<DirectoryItem>({
      endpoint: "franchises",
      query: buildFranchiseBySlugQuery(escapeIgdbString(slug)),
    })
  )[0] ?? null;

export const getFranchiseGames = (id: number, limit = 180) =>
  igdbPost<IgdbGame>({
    endpoint: "games",
    query: buildFranchiseGamesQuery(id, limit),
  });

export const getGameBySlug = async (slug: string): Promise<IgdbGame | null> => {
  const rows = await igdbPost<IgdbGame>({
    endpoint: "games",
    query: GAME_DETAIL_BY_SLUG_QUERY(escapeIgdbString(slug)),
  });

  return rows[0] ?? null;
};

export async function searchGames(query: string, limit = 24): Promise<IgdbGame[]> {
  const safeQuery = sanitizeText(query);
  if (!safeQuery) {
    return [];
  }

  return igdbPost<IgdbGame>({
    endpoint: "games",
    query: [
      "fields id,name,slug,summary,first_release_date,total_rating,total_rating_count,rating,cover.image_id,genres.name,platforms.name,themes.name,game_modes.name,involved_companies.company.name;",
      "where category = 0 & version_parent = null;",
      `search "${escapeIgdbString(safeQuery)}";`,
      "sort total_rating desc;",
      `limit ${Math.min(Math.max(limit, 1), 50)};`,
    ].join("\n"),
  });
}

export async function resolveGameReference(query: string): Promise<IgdbGame | null> {
  const safeQuery = sanitizeText(query);
  if (!safeQuery) {
    return null;
  }

  if (/^\d+$/.test(safeQuery)) {
    const byId = await igdbPost<IgdbGame>({
      endpoint: "games",
      query: `fields id,name,slug,summary,first_release_date,total_rating,total_rating_count,rating,cover.image_id,genres.name,platforms.name,themes.name,game_modes.name,involved_companies.company.name; where id = ${safeQuery}; limit 1;`,
    });
    return byId[0] ?? null;
  }

  const bySlug = await getGameBySlug(safeQuery.toLowerCase());
  if (bySlug) {
    return bySlug;
  }

  const results = await searchGames(safeQuery, 8);
  if (!results.length) {
    return null;
  }

  const normalized = safeQuery.toLowerCase();
  return (
    results.find((game) => game.name.toLowerCase() === normalized) ??
    results.find((game) => game.slug?.toLowerCase() === normalized) ??
    results[0] ??
    null
  );
}

export async function getRuleBasedRecommendations({
  genreId,
  platformId,
  gameModePreference,
  releasePreference,
  minimumRating,
  likeQuery,
}: {
  genreId: number | null;
  platformId: number | null;
  gameModePreference: "single-player" | "multiplayer" | "any";
  releasePreference: "released" | "upcoming" | "any";
  minimumRating: number;
  likeQuery: string;
}) {
  const unresolvedFilters: string[] = [];
  const seedGame = likeQuery ? await resolveGameReference(likeQuery) : null;
  if (likeQuery && !seedGame) {
    unresolvedFilters.push(`like:${likeQuery}`);
  }

  const whereClauses = ["category = 0", "version_parent = null"];

  if (genreId) {
    whereClauses.push(`genres = (${genreId})`);
  }

  if (platformId) {
    whereClauses.push(`platforms = (${platformId})`);
  }

  if (releasePreference === "released") {
    whereClauses.push(`first_release_date <= ${Math.floor(Date.now() / 1000)}`);
  } else if (releasePreference === "upcoming") {
    whereClauses.push(`first_release_date > ${Math.floor(Date.now() / 1000)}`);
  }

  if (minimumRating > 0) {
    whereClauses.push(`total_rating >= ${minimumRating}`);
  }

  if (gameModePreference === "single-player") {
    unresolvedFilters.push("mode:single-player");
  } else if (gameModePreference === "multiplayer") {
    unresolvedFilters.push("mode:multiplayer");
  }

  const games = await igdbPost<IgdbGame>({
    endpoint: "games",
    query: [
      "fields id,name,slug,summary,first_release_date,total_rating,total_rating_count,rating,cover.image_id,genres.name,platforms.name,themes.name,game_modes.name,involved_companies.company.name;",
      `where ${whereClauses.join(" & ")};`,
      releasePreference === "upcoming"
        ? "sort first_release_date asc;"
        : "sort total_rating desc;",
      "limit 24;",
    ].join("\n"),
  });

  return {
    games,
    seedGame,
    unresolvedFilters,
  };
}

export const sanitizeFranchiseSlug = (slug: string) =>
  /^[a-z0-9-]+$/.test(slug) ? slug : "";

export const sanitizeSortMode = (value?: string): GameSortMode =>
  value === "newest" || value === "upcoming" || value === "name"
    ? value
    : "top-rated";

export const sanitizeLimit = (value?: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.min(Math.max(Math.floor(parsed), 1), 80)
    : 24;
};

export type { GameSortMode } from "./types";
export type { IgdbGame as FranchiseGame } from "./types";
export const isIgdbConfigError = (error: unknown): error is IgdbConfigError =>
  error instanceof IgdbConfigError;
export const isIgdbUpstreamError = (error: unknown): error is IgdbUpstreamError =>
  error instanceof IgdbUpstreamError;
