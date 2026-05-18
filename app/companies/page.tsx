import { CompanyGrid, type CompanyCardData } from "components/directory";
import type { IgdbCompany } from "lib/igdb/types";
import {
  getFeaturedCompanies,
  isIgdbConfigError,
  isIgdbUpstreamError,
} from "lib/igdb/client";

export const metadata = {
  title: "Companies",
  description: "Browse game companies and studios from IGDB.",
};

function toYear(epochSeconds: number | null) {
  if (!epochSeconds) {
    return null;
  }

  return new Date(epochSeconds * 1000).getUTCFullYear();
}

export default async function CompaniesPage() {
  try {
    const companies = await getFeaturedCompanies();

    const companyCards: CompanyCardData[] = companies.map(
      (company: IgdbCompany) => ({
        id: company.id,
        name: company.name,
        slug: company.slug,
        logoImageId: company.logo?.image_id ?? null,
        description: company.description,
        foundedYear: toYear(company.start_date),
      }),
    );

    return (
      <section className="mx-auto max-w-(--breakpoint-2xl) px-4 pb-10 pt-4">
        <header className="mb-6 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Companies</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Browse game companies and studios sourced from IGDB.
          </p>
        </header>

        {companyCards.length ? (
          <CompanyGrid companies={companyCards} />
        ) : (
          <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
            No companies are available right now.
          </p>
        )}
      </section>
    );
  } catch (error) {
    let message = "Unable to load companies right now.";

    if (isIgdbConfigError(error)) {
      message = "IGDB credentials are not configured.";
    } else if (isIgdbUpstreamError(error)) {
      message = "IGDB is temporarily unavailable.";
    }

    return (
      <section className="mx-auto max-w-(--breakpoint-2xl) px-4 pb-10 pt-4">
        <header className="mb-6 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Companies</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Browse game companies and studios sourced from IGDB.
          </p>
        </header>

        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
          {message}
        </p>
      </section>
    );
  }
}
