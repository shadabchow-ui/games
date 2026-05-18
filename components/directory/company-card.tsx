import Link from "next/link";
import { GameCover } from "components/game/game-cover";

export type CompanyCardData = {
  id: number;
  name: string;
  slug: string;
  logoImageId?: string | null;
  description?: string | null;
  foundedYear?: number | null;
};

export function CompanyCard({ company }: { company: CompanyCardData }) {
  return (
    <Link
      aria-label={`Open ${company.name}`}
      className="block h-full overflow-hidden rounded-lg border border-neutral-200 bg-white transition-colors hover:border-blue-600 dark:border-neutral-800 dark:bg-black"
      href={`/company/${company.slug}`}
      prefetch={false}
    >
      <div className="relative aspect-[3/2]">
        <GameCover
          className="rounded-none border-0"
          imageClassName="rounded-none object-contain p-4"
          imageId={company.logoImageId}
          size="cover_big"
          title={`${company.name} logo`}
        />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-base font-semibold tracking-tight">
          {company.name}
        </h3>
        {company.foundedYear ? (
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Founded {company.foundedYear}
          </p>
        ) : null}
        {company.description ? (
          <p className="line-clamp-3 text-sm text-neutral-700 dark:text-neutral-300">
            {company.description}
          </p>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Description not available.
          </p>
        )}
      </div>
    </Link>
  );
}
