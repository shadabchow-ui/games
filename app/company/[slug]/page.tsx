import { GameGrid } from "components/game/game-grid";
import {
  getCompanyBySlug,
  getCompanyDevelopedGames,
  getCompanyPublishedGames,
  isIgdbConfigError,
  isIgdbUpstreamError,
} from "lib/igdb/client";
import { buildIgdbImageUrl } from "lib/igdb/images";
import { mapIgdbGameToCard } from "lib/igdb/mappers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 900;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;

  try {
    const company = await getCompanyBySlug(params.slug);
    if (!company) return { title: "Company not found" };
    return {
      title: company.name,
      description: company.description || `Company profile for ${company.name}.`,
    };
  } catch {
    return { title: "Company" };
  }
}

function toYear(epochSeconds: number | null) {
  return epochSeconds ? new Date(epochSeconds * 1000).getUTCFullYear() : null;
}

function normalizeWebsiteUrl(url: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export default async function CompanyDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;

  try {
    const company = await getCompanyBySlug(params.slug);
    if (!company) notFound();

    const [developedGamesRaw, publishedGamesRaw] = await Promise.all([
      getCompanyDevelopedGames(company.id),
      getCompanyPublishedGames(company.id),
    ]);

    const developedGames = developedGamesRaw.map(mapIgdbGameToCard);
    const publishedGames = publishedGamesRaw.map(mapIgdbGameToCard);
    const foundedYear = toYear(company.start_date);
    const logoImageId = company.logo?.image_id ?? null;
    const logoUrl = logoImageId ? buildIgdbImageUrl(logoImageId, "cover_big") : null;
    const websiteLinks = (company.websites || [])
      .map((website) => normalizeWebsiteUrl(website.url))
      .filter((url): url is string => Boolean(url));

    return (
      <section className="mx-auto max-w-(--breakpoint-2xl) space-y-8 px-4 pb-10 pt-4">
        <header className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-black md:grid-cols-[auto,1fr]">
          <div className="relative h-24 w-24 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700">
            {logoUrl ? (
              <Image
                alt={`${company.name} logo`}
                className="object-contain p-2"
                fill
                sizes="96px"
                src={logoUrl}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-neutral-500 dark:text-neutral-400">
                No logo
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{company.name}</h1>
            {foundedYear ? (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Founded {foundedYear}</p>
            ) : null}
            {company.description ? (
              <p className="text-sm text-neutral-700 dark:text-neutral-300">{company.description}</p>
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Description not available.</p>
            )}
            {websiteLinks.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {websiteLinks.map((url, index) => (
                  <Link
                    className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 hover:border-blue-600 hover:text-blue-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-blue-300"
                    href={url}
                    key={`${url}-${index}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Official link {index + 1}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Developed games</h2>
          <GameGrid
            emptyMessage="No developed games are available for this company."
            games={developedGames}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Published games</h2>
          <GameGrid
            emptyMessage="No published games are available for this company."
            games={publishedGames}
          />
        </section>
      </section>
    );
  } catch (error) {
    if (isIgdbConfigError(error) || isIgdbUpstreamError(error)) {
      return (
        <section className="mx-auto max-w-(--breakpoint-2xl) px-4 pb-10 pt-4">
          <h1 className="text-2xl font-semibold tracking-tight">Company unavailable</h1>
          <p className="pt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Company data is temporarily unavailable.
          </p>
        </section>
      );
    }

    throw error;
  }
}
