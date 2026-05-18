import { GameGrid } from "components/game/game-grid";
import {
  getPlatformBySlug,
  getRecentGamesByPlatform,
  getTopGamesByPlatform,
  getUpcomingGamesByPlatform,
  isIgdbConfigError,
  isIgdbUpstreamError,
} from "lib/igdb/client";
import { mapIgdbGameToCard } from "lib/igdb/mappers";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return {
    title: `Platform: ${slug}`,
    description: `Browse top, recent, and upcoming games on ${slug}.`,
  };
}

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <section className="mx-auto max-w-(--breakpoint-2xl) px-4 pb-10 pt-4">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="pt-2 text-sm text-neutral-600 dark:text-neutral-300">{message}</p>
    </section>
  );
}

export default async function PlatformDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const platform = await getPlatformBySlug(slug);

    if (!platform) {
      notFound();
    }

    const [topGames, recentGames, upcomingGames] = await Promise.all([
      getTopGamesByPlatform(platform.id),
      getRecentGamesByPlatform(platform.id),
      getUpcomingGamesByPlatform(platform.id),
    ]);

    return (
      <section className="mx-auto max-w-(--breakpoint-2xl) space-y-10 px-4 pb-10 pt-4">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{platform.name}</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Games currently cataloged for this platform.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Top games</h2>
          <GameGrid
            emptyMessage="No top-rated games are available for this platform."
            games={topGames.map(mapIgdbGameToCard)}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Recently released</h2>
          <GameGrid
            emptyMessage="No recent releases are available for this platform."
            games={recentGames.map(mapIgdbGameToCard)}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Upcoming</h2>
          <GameGrid
            emptyMessage="No upcoming games are available for this platform."
            games={upcomingGames.map(mapIgdbGameToCard)}
          />
        </section>
      </section>
    );
  } catch (error) {
    if (isIgdbConfigError(error)) {
      return (
        <ErrorState
          message="IGDB credentials are not configured on the server."
          title="Platform"
        />
      );
    }

    if (isIgdbUpstreamError(error)) {
      return (
        <ErrorState
          message="Unable to load this platform from IGDB right now."
          title="Platform"
        />
      );
    }

    throw error;
  }
}
