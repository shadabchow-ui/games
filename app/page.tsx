import { CompanyGrid, type CompanyCardData } from "components/directory";
import { DirectoryTileGrid } from "components/directory/directory-tile-grid";
import { GameGrid } from "components/game";
import Search from "components/layout/navbar/search";
import {
  getFeaturedCompanies,
  getGenres,
  getPlatforms,
  getRecentlyReleasedGameCards,
  getTopRatedGameCards,
  getUpcomingGameCards,
  hasIgdbCredentials,
} from "lib/igdb";
import type { IgdbCompany } from "lib/igdb/types";

export const metadata = {
  description: "Live video game discovery powered by IGDB.",
  openGraph: {
    type: "website",
  },
};

function SectionShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-black dark:text-white">
          {title}
        </h2>
      </div>
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

function toCompanyCard(company: IgdbCompany): CompanyCardData {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    logoImageId: company.logo?.image_id ?? null,
    description: company.description,
    foundedYear: company.start_date
      ? new Date(company.start_date * 1000).getUTCFullYear()
      : null,
  };
}

export default async function HomePage() {
  const hasCreds = hasIgdbCredentials();

  const [
    topRatedGames,
    recentlyReleasedGames,
    upcomingGames,
    genres,
    platforms,
    companies,
  ] = hasCreds
    ? await Promise.all([
        getTopRatedGameCards(),
        getRecentlyReleasedGameCards(),
        getUpcomingGameCards(),
        getGenres(),
        getPlatforms(),
        getFeaturedCompanies(),
      ])
    : [[], [], [], [], [], []];

  const fallbackMessage = hasCreds
    ? "Live directory data is temporarily unavailable. Please try again soon."
    : "Add TWITCH_CLIENT_ID plus TWITCH_ACCESS_TOKEN or TWITCH_CLIENT_SECRET on the server to load live IGDB data.";

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-2xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-100 p-8 dark:border-neutral-800 dark:from-neutral-950 dark:to-neutral-900 lg:grid-cols-[1.45fr,0.9fr]">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              Upcube Games Directory
            </p>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-black dark:text-white sm:text-4xl">
              Discover what to play next with useful live IGDB browsing.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
              Search for a game, then browse strong sections for top games, new
              releases, upcoming launches, popular platforms, common genres, and
              featured studios.
            </p>
            <div className="mt-6 max-w-2xl">
              <Search />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-xl border border-neutral-200 bg-white/80 p-4 dark:border-neutral-800 dark:bg-black/30">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                Browse
              </p>
              <p className="mt-2 text-lg font-semibold">
                Games, platforms, and genres
              </p>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                Main directory pages now favor useful live IGDB data instead of
                sparse edge cases.
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white/80 p-4 dark:border-neutral-800 dark:bg-black/30">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                Compare
              </p>
              <p className="mt-2 text-lg font-semibold">
                Recommendations without paid AI
              </p>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                Rule-based recommendation and comparison routes stay useful even
                without external AI providers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionShell title="Top games">
        {topRatedGames.length ? (
          <GameGrid emptyMessage={fallbackMessage} games={topRatedGames} />
        ) : (
          <EmptyState message={fallbackMessage} />
        )}
      </SectionShell>

      <SectionShell title="New releases">
        {recentlyReleasedGames.length ? (
          <GameGrid
            emptyMessage={fallbackMessage}
            games={recentlyReleasedGames}
          />
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

      <SectionShell title="Popular platforms">
        {platforms.length ? (
          <DirectoryTileGrid items={platforms.slice(0, 12)} kind="platform" />
        ) : (
          <EmptyState message={fallbackMessage} />
        )}
      </SectionShell>

      <SectionShell title="Browse by genre">
        {genres.length ? (
          <DirectoryTileGrid items={genres.slice(0, 12)} kind="genre" />
        ) : (
          <EmptyState message={fallbackMessage} />
        )}
      </SectionShell>

      <SectionShell title="Featured companies">
        {companies.length ? (
          <CompanyGrid companies={companies.slice(0, 8).map(toCompanyCard)} />
        ) : (
          <EmptyState message={fallbackMessage} />
        )}
      </SectionShell>
    </>
  );
}
