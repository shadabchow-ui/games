import { unstable_cacheLife as cacheLife } from "next/cache";

import { igdbRequest } from "./client";
import { escapeIgdbString, toGameCardData } from "./format";
import type { GameCardData, IgdbGame } from "./types";

const MAX_QUERY_LENGTH = 80;
const DEFAULT_LIMIT = 24;

function sanitizeQuery(rawQuery: string): string {
  return rawQuery.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

export function normalizeSearchQuery(
  query: string | string[] | undefined,
): string {
  if (Array.isArray(query)) {
    return sanitizeQuery(query[0] ?? "");
  }

  return sanitizeQuery(query ?? "");
}

export async function searchIGDBGames(
  rawQuery: string,
  options?: { limit?: number },
): Promise<GameCardData[]> {
  "use cache";
  // Search results are query-specific, so keep the cache window short to avoid stale matches.
  cacheLife("seconds");

  const query = sanitizeQuery(rawQuery);
  if (!query) {
    return [];
  }

  const limit = Math.min(Math.max(options?.limit ?? DEFAULT_LIMIT, 1), 50);
  const body = [
    "fields id, name, slug, summary, first_release_date, total_rating, total_rating_count, cover.image_id, genres.name, platforms.name;",
    "where category = (0,8,9,10) & version_parent = null;",
    `search "${escapeIgdbString(query)}";`,
    "sort total_rating desc;",
    `limit ${limit};`,
  ].join("\n");

  const games = await igdbRequest<IgdbGame>("games", body);
  return games.map(toGameCardData);
}
