import { GameGrid } from "components/game/game-grid";
import { mapIgdbGameToCard } from "lib/igdb/mappers";
import { searchGames } from "lib/igdb/client";

export const metadata = {
  title: "Search Games",
  description: "Search for games by name.",
};

function normalizeSearchQuery(query: string | string[] | undefined) {
  if (Array.isArray(query)) {
    return (query[0] ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  }

  return (query ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
}

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const searchValue = normalizeSearchQuery(searchParams?.q);

  if (!searchValue) {
    return (
      <section className="rounded-xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
        Enter a game title to search the IGDB catalog.
      </section>
    );
  }

  try {
    const games = (await searchGames(searchValue)).map(mapIgdbGameToCard);
    const resultsText = games.length === 1 ? "result" : "results";

    if (games.length === 0) {
      return (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          No games found for{" "}
          <span className="font-semibold">"{searchValue}"</span>.
        </section>
      );
    }

    return (
      <>
        <p className="mb-4 text-sm text-neutral-700 dark:text-neutral-300">
          Showing {games.length} {resultsText} for{" "}
          <span className="font-semibold">"{searchValue}"</span>
        </p>
        <GameGrid
          emptyMessage="No games are available for this search."
          games={games}
        />
      </>
    );
  } catch {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
        Search is temporarily unavailable. Please try again in a moment.
      </section>
    );
  }
}
