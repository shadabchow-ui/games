import { searchGames } from "./client";
import { toGameCardData } from "./format";
import type { GameCardData } from "./types";

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
  const query = sanitizeQuery(rawQuery);
  if (!query) {
    return [];
  }

  const limit = Math.min(Math.max(options?.limit ?? DEFAULT_LIMIT, 1), 50);
  return (await searchGames(query, limit)).map(toGameCardData);
}
