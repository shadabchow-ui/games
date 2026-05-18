import { DirectoryTileGrid } from "components/directory/directory-tile-grid";
import { GameGrid } from "components/game";
import {
  getGenres,
  getPlatforms,
  getRecentlyReleasedGameCards,
  getTopRatedGameCards,
  getUpcomingGameCards,
  hasIgdbCredentials,
} from "lib/igdb";

export const metadata = {
  description: "Live video game discovery powered by IGDB.",
  openGraph: {
    type: "website",
  },
};

function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-black dark:text-white">{title}</h2>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-100 p-6 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
      {message}
    </div>
  );
}

export default async function HomePage() {
  const hasCreds = hasIgdbCredentials();

  const [topRatedGames, recentlyReleasedGames, upcomingGames, genres, platforms] = hasCreds
    ? await Promise.all([
        getTopRatedGameCards(),
        getRecentlyReleasedGameCards(),
        getUpcomingGameCards(),
        getGenres(),
        getPlatforms(),
      ])
    : [[], [], [], [], []];

  const fallbackMessage = hasCreds
    ? "Live directory data is temporarily unavailable. Please try again soon."
    : "Add TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET on the server to load live IGDB data.";

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-100 p-8 dark:border-neutral-800 dark:from-neutral-950 dark:to-neutral-900">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">Upcube Games Directory</p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-black dark:text-white sm:text-4xl">
            Discover what to play next with live IGDB-powered game sections.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
            Browse top-rated releases, recent launches, upcoming titles, and the genres and platforms shaping the next wave of games.
          </p>
        </div>
      </section>

      <SectionShell title="Top-rated games">
        {topRatedGames.length ? (
          <GameGrid emptyMessage={fallbackMessage} games={topRatedGames} />
        ) : (
          <EmptyState message={fallbackMessage} />
        )}
      </SectionShell>

      <SectionShell title="Recently released games">
        {recentlyReleasedGames.length ? (
          <GameGrid emptyMessage={fallbackMessage} games={recentlyReleasedGames} />
        ) : (
          <EmptyState message={fallbackMessage} />
        )}
      </SectionShell>

      <SectionShell title="Upcoming games">
        {upcomingGames.length ? (
          <GameGrid emptyMessage={fallbackMessage} games={upcomingGames} />
        ) : (
          <EmptyState message={fallbackMessage} />
        )}
      </SectionShell>

      <SectionShell title="Browse by genre">
        {genres.length ? <DirectoryTileGrid items={genres} kind="genre" /> : <EmptyState message={fallbackMessage} />}
      </SectionShell>

      <SectionShell title="Browse by platform">
        {platforms.length ? <DirectoryTileGrid items={platforms} kind="platform" /> : <EmptyState message={fallbackMessage} />}
      </SectionShell>
    </>
  );
}
