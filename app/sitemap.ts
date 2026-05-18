import { baseUrl } from "lib/utils";
import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date().toISOString();
  return [
    {
      url: `${baseUrl}/`,
      lastModified,
    },
    {
      url: `${baseUrl}/platforms`,
      lastModified,
    },
    {
      url: `${baseUrl}/genres`,
      lastModified,
    },
    {
      url: `${baseUrl}/studios`,
      lastModified,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
    },
  ];
}
