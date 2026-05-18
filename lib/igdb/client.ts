import "server-only";

import type {
  CachedTwitchToken,
  DirectoryItem,
  GameCardData,
  GameSortMode,
  IgdbApiErrorResponse,
  IgdbCompany,
  IgdbEntity,
  IgdbExternalLink,
  IgdbGame,
  IgdbGameMode,
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
  buildRankedGamesQuery,
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

const IGDB_BASE = process.env.IGDB_BASE_URL || "https://api.igdb.com/v4";
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const TOKEN_REFRESH_BUFFER_MS = 60_000;
const DEFAULT_LIMIT = 24;
const MAX_QUERY_LENGTH = 80;

const PREFERRED_PLATFORM_NAMES = [
  "PC (Microsoft Windows)",
  "PlayStation 5",
  "PlayStation 4",
  "Xbox Series X|S",
  "Xbox One",
  "Nintendo Switch",
  "Nintendo Switch 2",
  "Steam Deck",
  "iOS",
  "Android",
];

const PREFERRED_GENRE_NAMES = [
  "Role-playing (RPG)",
  "Shooter",
  "Adventure",
  "Indie",
  "Platform",
  "Strategy",
  "Racing",
  "Sport",
  "Fighting",
  "Puzzle",
];

export class IgdbConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IgdbConfigError";
  }
}

export class IgdbUpstreamError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "IgdbUpstreamError";
  }
}

let tokenCache: CachedTwitchToken | null = null;
let pendingTokenRequest: Promise<string> | null = null;

export const hasIgdbCredentials = () =>
  Boolean(
    (process.env.IGDB_CLIENT_ID || process.env.TWITCH_CLIENT_ID) &&
      (process.env.IGDB_ACCESS_TOKEN ||
        process.env.TWITCH_ACCESS_TOKEN ||
        process.env.TWITCH_CLIENT_SECRET),
  );

const escapeIgdbString = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const sanitizeText = (value: string | undefined | null) =>
  (value ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);

function uniqueById<T extends { id: number }>(items: T[]) {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function sortByPreferredNames<T extends { name: string }>(
  items: T[],
  preferredNames: string[],
) {
  const preferredMap = new Map(
    preferredNames.map((name, index) => [name.toLowerCase(), index]),
  );

  const score = (name: string) => {
    const exact = preferredMap.get(name.toLowerCase());
    if (typeof exact === "number") {
      return exact;
    }

    const fuzzy = preferredNames.findIndex((preferred) =>
      name.toLowerCase().includes(preferred.toLowerCase()),
    );
    return fuzzy >= 0
      ? fuzzy + preferredNames.length
      : Number.POSITIVE_INFINITY;
  };

  return [...items].sort((left, right) => {
    const leftScore = score(left.name);
    const rightScore = score(right.name);
    if (leftScore !== rightScore) {
      return leftScore - rightScore;
    }
    return left.name.localeCompare(right.name);
  });
}

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

  if (
    tokenCache &&
    tokenCache.expiresAt > Date.now() + TOKEN_REFRESH_BUFFER_MS
  ) {
    return tokenCache.accessToken;
  }

  if (pendingTokenRequest) {
    return pendingTokenRequest;
  }

  pendingTokenRequest = (async () => {
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
      throw new IgdbUpstreamError(
        "Unable to authenticate with Twitch",
        response.status,
      );
    }

    const json = (await response.json()) as TwitchTokenResponse;
    tokenCache = {
      accessToken: json.access_token,
      expiresAt: Date.now() + json.expires_in * 1000,
    };

    return json.access_token;
  })().finally(() => {
    pendingTokenRequest = null;
  });

  return pendingTokenRequest;
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
    const errorBody = (await response
      .json()
      .catch(() => null)) as IgdbApiErrorResponse | null;
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

function toCard(game: IgdbGame): GameCardData {
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

async function executeGameFallbackQueries(queries: string[]) {
  for (const query of queries) {
    const games = uniqueById(
      await igdbPost<IgdbGame>({ endpoint: "games", query }),
    );
    if (games.length > 0) {
      return games;
    }
  }

  return [] as IgdbGame[];
}

async function getRankedGamesWithFallback(options: {
  sort: "rating" | "release-desc" | "release-asc" | "name";
  genreId?: number | null;
  platformId?: number | null;
  releasedOnly?: boolean;
  upcomingOnly?: boolean;
  limit?: number;
}) {
  const limit = options.limit ?? DEFAULT_LIMIT;
  return executeGameFallbackQueries([
    buildRankedGamesQuery({
      ...options,
      limit,
      requireCover: true,
      minimumRatingCount: options.sort === "rating" ? 25 : undefined,
    }),
    buildRankedGamesQuery({
      ...options,
      limit,
      requireCover: true,
      minimumRatingCount: options.sort === "rating" ? 5 : undefined,
    }),
    buildRankedGamesQuery({
      ...options,
      limit,
      requireCover: true,
      mainGameOnly: false,
    }),
    buildRankedGamesQuery({
      ...options,
      limit,
      requireCover: false,
      mainGameOnly: false,
    }),
  ]);
}

async function searchEntities<T extends IgdbEntity>(
  endpoint: string,
  query: string,
  limit = 8,
): Promise<T[]> {
  const safeQuery = sanitizeText(query);
  if (!safeQuery) {
    return [];
  }

  return igdbPost<T>({
    endpoint,
    query: `
fields id,name,slug;
search "${escapeIgdbString(safeQuery)}";
where name != null & slug != null;
limit ${limit};
`,
  });
}

export const getTopRatedGames = async () =>
  (
    await getRankedGamesWithFallback({ sort: "rating", releasedOnly: true })
  ).map(toCard);

export const getRecentlyReleasedGames = async () =>
  (
    await executeGameFallbackQueries([
      RECENTLY_RELEASED_GAMES_QUERY,
      buildRankedGamesQuery({
        sort: "release-desc",
        releasedOnly: true,
        requireCover: false,
        limit: DEFAULT_LIMIT,
      }),
    ])
  ).map(toCard);

export const getUpcomingGames = async () =>
  (
    await executeGameFallbackQueries([
      UPCOMING_GAMES_QUERY,
      buildRankedGamesQuery({
        sort: "release-asc",
        upcomingOnly: true,
        requireCover: false,
        limit: DEFAULT_LIMIT,
      }),
    ])
  ).map(toCard);

export const getTopRatedGameCards = getTopRatedGames;
export const getRecentlyReleasedGameCards = getRecentlyReleasedGames;
export const getUpcomingGameCards = getUpcomingGames;

export const getGamesDirectory = async ({
  sort,
  limit,
}: {
  sort: GameSortMode;
  limit: number;
}) => {
  const safeLimit = Math.min(Math.max(limit, 1), 48);
  const games =
    sort === "newest"
      ? await getRankedGamesWithFallback({
          sort: "release-desc",
          releasedOnly: true,
          limit: safeLimit,
        })
      : sort === "upcoming"
        ? await getRankedGamesWithFallback({
            sort: "release-asc",
            upcomingOnly: true,
            limit: safeLimit,
          })
        : sort === "name"
          ? await getRankedGamesWithFallback({
              sort: "name",
              releasedOnly: true,
              limit: safeLimit,
            })
          : await executeGameFallbackQueries([
              buildGamesDirectoryQuery("top-rated", safeLimit),
              buildRankedGamesQuery({
                sort: "rating",
                releasedOnly: true,
                requireCover: true,
                minimumRatingCount: 5,
                limit: safeLimit,
              }),
              buildRankedGamesQuery({
                sort: "release-desc",
                releasedOnly: true,
                requireCover: true,
                limit: safeLimit,
              }),
              buildRankedGamesQuery({
                sort: "release-desc",
                releasedOnly: true,
                requireCover: false,
                mainGameOnly: false,
                limit: safeLimit,
              }),
            ]);

  return games.map(toCard);
};

export const getGenres = async () =>
  sortByPreferredNames(
    uniqueById(
      await igdbPost<DirectoryItem>({
        endpoint: "genres",
        query: LIST_GENRES_QUERY,
      }),
    ),
    PREFERRED_GENRE_NAMES,
  );

export const getPlatforms = async () =>
  sortByPreferredNames(
    uniqueById(
      await igdbPost<DirectoryItem>({
        endpoint: "platforms",
        query: LIST_PLATFORMS_QUERY,
      }),
    ),
    PREFERRED_PLATFORM_NAMES,
  );

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

export const getTopGamesByGenre = async (id: number) =>
  executeGameFallbackQueries([
    buildTopGamesByGenreQuery(id),
    buildRankedGamesQuery({
      sort: "rating",
      genreId: id,
      releasedOnly: true,
      requireCover: false,
      minimumRatingCount: 1,
      limit: DEFAULT_LIMIT,
    }),
    buildRankedGamesQuery({
      sort: "release-desc",
      genreId: id,
      releasedOnly: true,
      requireCover: false,
      mainGameOnly: false,
      limit: DEFAULT_LIMIT,
    }),
  ]);

export const getRecentGamesByGenre = async (id: number) =>
  executeGameFallbackQueries([
    buildRecentGamesByGenreQuery(id),
    buildRankedGamesQuery({
      sort: "release-desc",
      genreId: id,
      releasedOnly: true,
      requireCover: false,
      limit: DEFAULT_LIMIT,
    }),
    buildRankedGamesQuery({
      sort: "release-desc",
      genreId: id,
      releasedOnly: true,
      requireCover: false,
      mainGameOnly: false,
      limit: DEFAULT_LIMIT,
    }),
  ]);

export const getUpcomingGamesByGenre = async (id: number) =>
  executeGameFallbackQueries([
    buildUpcomingGamesByGenreQuery(id),
    buildRankedGamesQuery({
      sort: "release-asc",
      genreId: id,
      upcomingOnly: true,
      requireCover: false,
      limit: DEFAULT_LIMIT,
    }),
    buildRankedGamesQuery({
      sort: "release-asc",
      genreId: id,
      upcomingOnly: true,
      requireCover: false,
      mainGameOnly: false,
      limit: DEFAULT_LIMIT,
    }),
  ]);

export const getTopGamesByPlatform = async (id: number) =>
  executeGameFallbackQueries([
    buildTopGamesByPlatformQuery(id),
    buildRankedGamesQuery({
      sort: "rating",
      platformId: id,
      releasedOnly: true,
      requireCover: false,
      minimumRatingCount: 1,
      limit: DEFAULT_LIMIT,
    }),
    buildRankedGamesQuery({
      sort: "release-desc",
      platformId: id,
      releasedOnly: true,
      requireCover: false,
      mainGameOnly: false,
      limit: DEFAULT_LIMIT,
    }),
  ]);

export const getRecentGamesByPlatform = async (id: number) =>
  executeGameFallbackQueries([
    buildRecentGamesByPlatformQuery(id),
    buildRankedGamesQuery({
      sort: "release-desc",
      platformId: id,
      releasedOnly: true,
      requireCover: false,
      limit: DEFAULT_LIMIT,
    }),
    buildRankedGamesQuery({
      sort: "release-desc",
      platformId: id,
      releasedOnly: true,
      requireCover: false,
      mainGameOnly: false,
      limit: DEFAULT_LIMIT,
    }),
  ]);

export const getUpcomingGamesByPlatform = async (id: number) =>
  executeGameFallbackQueries([
    buildUpcomingGamesByPlatformQuery(id),
    buildRankedGamesQuery({
      sort: "release-asc",
      platformId: id,
      upcomingOnly: true,
      requireCover: false,
      limit: DEFAULT_LIMIT,
    }),
    buildRankedGamesQuery({
      sort: "release-asc",
      platformId: id,
      upcomingOnly: true,
      requireCover: false,
      mainGameOnly: false,
      limit: DEFAULT_LIMIT,
    }),
  ]);

export const getFeaturedCompanies = async () =>
  uniqueById(
    await igdbPost<IgdbCompany>({
      endpoint: "companies",
      query: FEATURED_COMPANIES_QUERY,
    }),
  );

export const getCompanyBySlug = async (slug: string) =>
  (
    await igdbPost<IgdbCompany>({
      endpoint: "companies",
      query: buildCompanyBySlugQuery(escapeIgdbString(slug)),
    })
  )[0] ?? null;

export const getCompanyDevelopedGames = async (id: number) =>
  igdbPost<{ game: IgdbGame | null }>({
    endpoint: "involved_companies",
    query: buildCompanyGamesQuery(id, "developer"),
  }).then((rows) =>
    rows
      .map((row) => row.game)
      .filter((game): game is IgdbGame => game !== null && game.cover !== null),
  );

export const getCompanyPublishedGames = async (id: number) =>
  igdbPost<{ game: IgdbGame | null }>({
    endpoint: "involved_companies",
    query: buildCompanyGamesQuery(id, "publisher"),
  }).then((rows) =>
    rows
      .map((row) => row.game)
      .filter((game): game is IgdbGame => game !== null && game.cover !== null),
  );

export const getFranchisesDirectory = async (limit = 90) =>
  (
    await igdbPost<DirectoryItem>({
      endpoint: "franchises",
      query: FRANCHISES_DIRECTORY_QUERY.replace(
        "limit 200;",
        `limit ${Math.min(Math.max(limit, 1), 200)};`,
      ),
    })
  ).sort(
    (left, right) => (right.games?.length ?? 0) - (left.games?.length ?? 0),
  );

export const getFranchiseBySlug = async (slug: string) =>
  (
    await igdbPost<DirectoryItem>({
      endpoint: "franchises",
      query: buildFranchiseBySlugQuery(escapeIgdbString(slug)),
    })
  )[0] ?? null;

export const getFranchiseGames = async (id: number, limit = 180) =>
  executeGameFallbackQueries([
    buildFranchiseGamesQuery(id, limit),
    buildRankedGamesQuery({
      sort: "release-desc",
      requireCover: false,
      limit,
    }),
  ]);

export const getGameBySlug = async (slug: string): Promise<IgdbGame | null> => {
  const rows = await igdbPost<IgdbGame>({
    endpoint: "games",
    query: GAME_DETAIL_BY_SLUG_QUERY(escapeIgdbString(slug)),
  });

  return rows[0] ?? null;
};

export async function searchGames(
  query: string,
  limit = DEFAULT_LIMIT,
): Promise<IgdbGame[]> {
  const safeQuery = sanitizeText(query);
  if (!safeQuery) {
    return [];
  }

  return executeGameFallbackQueries([
    `
fields
  id,
  name,
  slug,
  summary,
  first_release_date,
  total_rating,
  total_rating_count,
  rating,
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
  involved_companies.company.name,
  involved_companies.company.slug,
  similar_games.id;
search "${escapeIgdbString(safeQuery)}";
where category = 0 & version_parent = null & cover != null;
sort total_rating desc;
limit ${Math.min(Math.max(limit, 1), 50)};
`,
    `
fields
  id,
  name,
  slug,
  summary,
  first_release_date,
  total_rating,
  total_rating_count,
  rating,
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
  involved_companies.company.name,
  involved_companies.company.slug,
  similar_games.id;
search "${escapeIgdbString(safeQuery)}";
where category = 0;
sort first_release_date desc;
limit ${Math.min(Math.max(limit, 1), 50)};
`,
    `
fields
  id,
  name,
  slug,
  summary,
  first_release_date,
  total_rating,
  total_rating_count,
  rating,
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
  involved_companies.company.name,
  involved_companies.company.slug,
  similar_games.id;
search "${escapeIgdbString(safeQuery)}";
where name != null;
sort first_release_date desc;
limit ${Math.min(Math.max(limit, 1), 50)};
`,
  ]);
}

export async function resolveGameReference(
  query: string,
): Promise<IgdbGame | null> {
  const safeQuery = sanitizeText(query);
  if (!safeQuery) {
    return null;
  }

  if (/^\d+$/.test(safeQuery)) {
    const byId = await igdbPost<IgdbGame>({
      endpoint: "games",
      query: `
fields
  id,
  name,
  slug,
  summary,
  first_release_date,
  total_rating,
  total_rating_count,
  rating,
  cover.image_id,
  genres.id,
  genres.name,
  platforms.id,
  platforms.name,
  themes.id,
  themes.name,
  game_modes.id,
  game_modes.name,
  involved_companies.company.name,
  similar_games.id;
where id = ${safeQuery};
limit 1;
`,
    });
    return byId[0] ?? null;
  }

  const looksLikeSlug = /^[a-z0-9-]+$/.test(safeQuery);

  if (looksLikeSlug) {
    const bySlug = await getGameBySlug(safeQuery.toLowerCase());
    if (bySlug) {
      return bySlug;
    }
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

async function getModeIds(
  preference: "any" | "single-player" | "multiplayer",
): Promise<number[]> {
  if (preference === "any") {
    return [];
  }

  const rows = await searchEntities<IgdbGameMode>(
    "game_modes",
    preference === "single-player" ? "Single player" : "Multiplayer",
    6,
  );
  return rows.map((row) => row.id);
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
  gameModePreference: "any" | "single-player" | "multiplayer";
  releasePreference: "any" | "released" | "upcoming";
  minimumRating: number;
  likeQuery: string;
}) {
  const seedGame = likeQuery ? await resolveGameReference(likeQuery) : null;
  const modeIds = await getModeIds(gameModePreference);
  const unresolvedFilters: string[] = [];

  if (gameModePreference !== "any" && modeIds.length === 0) {
    unresolvedFilters.push("game mode");
  }

  const whereClauses = [
    "category = 0",
    "version_parent = null",
    "cover != null",
    genreId ? `genres = (${genreId})` : null,
    platformId ? `platforms = (${platformId})` : null,
    modeIds.length ? `game_modes = (${modeIds.join(",")})` : null,
    releasePreference === "released"
      ? `first_release_date != null & first_release_date <= ${Math.floor(Date.now() / 1000)}`
      : null,
    releasePreference === "upcoming"
      ? `first_release_date != null & first_release_date > ${Math.floor(Date.now() / 1000)}`
      : null,
    minimumRating > 0 ? `total_rating >= ${minimumRating}` : null,
    seedGame ? `id != ${seedGame.id}` : null,
  ].filter((value): value is string => Boolean(value));

  const similarIds = (seedGame?.similar_games ?? [])
    .map((game) => game.id)
    .slice(0, 16);
  if (similarIds.length) {
    whereClauses.push(`id = (${similarIds.join(",")})`);
  }

  let games = await igdbPost<IgdbGame>({
    endpoint: "games",
    query: [
      "fields id,name,slug,summary,first_release_date,total_rating,total_rating_count,rating,cover.image_id,genres.id,genres.name,genres.slug,platforms.id,platforms.name,platforms.slug,themes.id,themes.name,game_modes.id,game_modes.name,involved_companies.company.name,involved_companies.company.slug,similar_games.id;",
      `where ${whereClauses.join(" & ")};`,
      releasePreference === "upcoming"
        ? "sort first_release_date asc;"
        : "sort total_rating desc;",
      "limit 24;",
    ].join("\n"),
  });

  if (!games.length) {
    games = await executeGameFallbackQueries([
      buildRankedGamesQuery({
        sort: releasePreference === "upcoming" ? "release-asc" : "rating",
        genreId,
        platformId,
        releasedOnly: releasePreference === "released",
        upcomingOnly: releasePreference === "upcoming",
        minimumRating,
        requireCover: true,
        limit: 24,
      }),
      buildRankedGamesQuery({
        sort: releasePreference === "upcoming" ? "release-asc" : "release-desc",
        genreId: genreId ?? seedGame?.genres?.[0]?.id ?? null,
        platformId: platformId ?? seedGame?.platforms?.[0]?.id ?? null,
        releasedOnly: releasePreference === "released",
        upcomingOnly: releasePreference === "upcoming",
        requireCover: true,
        limit: 24,
      }),
      buildRankedGamesQuery({
        sort: "rating",
        releasedOnly: true,
        requireCover: true,
        minimumRatingCount: 10,
        limit: 24,
      }),
    ]);
  }

  if (
    !games.length &&
    !genreId &&
    !platformId &&
    modeIds.length === 0 &&
    !seedGame &&
    releasePreference === "any"
  ) {
    games = await executeGameFallbackQueries([
      buildRankedGamesQuery({
        sort: "rating",
        releasedOnly: true,
        requireCover: true,
        minimumRatingCount: 1,
        mainGameOnly: false,
        limit: 24,
      }),
      buildRankedGamesQuery({
        sort: "release-desc",
        releasedOnly: true,
        requireCover: true,
        mainGameOnly: false,
        limit: 24,
      }),
    ]);
  }

  return {
    games,
    seedGame,
    unresolvedFilters,
  };
}

export function toGameCard(game: IgdbGame): GameCardData {
  return toCard(game);
}

export function sanitizeFranchiseSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug) ? slug : "";
}

export function sanitizeSortMode(value?: string): GameSortMode {
  return value === "newest" || value === "upcoming" || value === "name"
    ? value
    : "top-rated";
}

export function sanitizeLimit(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.min(Math.max(Math.floor(parsed), 1), 80)
    : DEFAULT_LIMIT;
}

export const isIgdbConfigError = (error: unknown): error is IgdbConfigError =>
  error instanceof IgdbConfigError;

export const isIgdbUpstreamError = (
  error: unknown,
): error is IgdbUpstreamError => error instanceof IgdbUpstreamError;
