import { DirectoryGrid } from "components/directory/directory-grid";
import {
  getGenres,
  isIgdbConfigError,
  isIgdbUpstreamError,
} from "lib/igdb/client";

export const metadata = {
  title: "Genres",
  description: "Browse game genres powered by live IGDB data.",
};

export const dynamic = "force-dynamic";

export default async function GenresPage() {
  try {
    const genres = await getGenres();

    return (
      <section className="mx-auto max-w-(--breakpoint-2xl) space-y-6 px-4 pb-10 pt-4">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Genres</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Start with core genres, then dig into broader IGDB genre browsing.
          </p>
        </header>
        <DirectoryGrid
          emptyMessage="No genres are available right now."
          hrefPrefix="/genre"
          items={genres}
        />
      </section>
    );
  } catch (error) {
    if (isIgdbConfigError(error)) {
      return (
        <section className="mx-auto max-w-(--breakpoint-2xl) px-4 pb-10 pt-4">
          <h1 className="text-3xl font-semibold tracking-tight">Genres</h1>
          <p className="pt-2 text-sm text-neutral-600 dark:text-neutral-300">
            IGDB credentials are not configured on the server.
          </p>
        </section>
      );
    }

    if (isIgdbUpstreamError(error)) {
      return (
        <section className="mx-auto max-w-(--breakpoint-2xl) px-4 pb-10 pt-4">
          <h1 className="text-3xl font-semibold tracking-tight">Genres</h1>
          <p className="pt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Unable to load genres from IGDB right now.
          </p>
        </section>
      );
    }

    throw error;
  }
}
