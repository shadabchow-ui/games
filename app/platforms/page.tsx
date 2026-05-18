import { DirectoryGrid } from "components/directory/directory-grid";
import {
  getPlatforms,
  isIgdbConfigError,
  isIgdbUpstreamError,
} from "lib/igdb/client";

export const metadata = {
  title: "Platforms",
  description: "Browse game platforms powered by live IGDB data.",
};

export const dynamic = "force-dynamic";

export default async function PlatformsPage() {
  try {
    const platforms = await getPlatforms();

    return (
      <section className="mx-auto max-w-(--breakpoint-2xl) space-y-6 px-4 pb-10 pt-4">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Platforms</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Explore game platforms and browse games available on each platform.
          </p>
        </header>
        <DirectoryGrid
          emptyMessage="No platforms are available right now."
          hrefPrefix="/platform"
          items={platforms}
        />
      </section>
    );
  } catch (error) {
    if (isIgdbConfigError(error)) {
      return (
        <section className="mx-auto max-w-(--breakpoint-2xl) px-4 pb-10 pt-4">
          <h1 className="text-3xl font-semibold tracking-tight">Platforms</h1>
          <p className="pt-2 text-sm text-neutral-600 dark:text-neutral-300">
            IGDB credentials are not configured on the server.
          </p>
        </section>
      );
    }

    if (isIgdbUpstreamError(error)) {
      return (
        <section className="mx-auto max-w-(--breakpoint-2xl) px-4 pb-10 pt-4">
          <h1 className="text-3xl font-semibold tracking-tight">Platforms</h1>
          <p className="pt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Unable to load platforms from IGDB right now.
          </p>
        </section>
      );
    }

    throw error;
  }
}
