import type { IgdbImageSize } from "./types";

const IGDB_IMAGE_CDN_BASE_URL = "https://images.igdb.com/igdb/image/upload";

export const buildIgdbImageUrl = (
  imageId: string,
  size: IgdbImageSize = "cover_big",
) => `${IGDB_IMAGE_CDN_BASE_URL}/t_${size}/${imageId}.jpg`;
