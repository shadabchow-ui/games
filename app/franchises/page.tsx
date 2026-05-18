import Link from "next/link";
import { getFranchisesDirectory } from "lib/igdb";

export const metadata = {
  title: "Franchises",
  description: "Browse video game franchises sourced from IGDB.",
};

export default async function FranchisesPage() {
  let franchises = [] as Awaited<ReturnType<typeof getFranchisesDirectory>>;
  let errorMessage: string | null = null;

  try {
    franchises = await getFranchisesDirectory(90);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Failed to load franchises.";
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <header className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Franchises</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Browse server-rendered franchise listings from IGDB.
        </p>
      </header>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          Unable to load franchises: {errorMessage}
        </div>
      ) : franchises.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          No franchises found.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {franchises.map((franchise) => (
            <li key={franchise.id}>
              <Link
                href={`/franchise/${franchise.slug}`}
                className="flex h-full items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-blue-600 dark:border-neutral-800 dark:bg-black"
              >
                <span className="font-medium">{franchise.name}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {(franchise.games?.length ?? 0) > 0
                    ? `${franchise.games?.length} games`
                    : "Games unknown"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
