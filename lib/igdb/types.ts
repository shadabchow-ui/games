export type IgdbImageSize =
  | "cover_small"
  | "screenshot_med"
  | "cover_big"
  | "logo_med"
  | "screenshot_big"
  | "screenshot_huge"
  | "thumb"
  | "micro"
  | "720p"
  | "1080p";

export type IgdbEntity = {
  id: number;
  name: string;
  slug: string;
};

export type IgdbGenre = IgdbEntity;
export type IgdbPlatform = IgdbEntity;
export type IgdbTheme = IgdbEntity;
export type IgdbGameMode = IgdbEntity;

export type DirectoryItem = {
  id: number;
  name: string;
  slug: string;
  games?: Array<{ id: number }>;
};

export type IgdbCover = {
  image_id: string;
} | null;

export type IgdbCompanyWebsite = {
  url: string | null;
  category: number | null;
};

export type IgdbCompany = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  start_date: number | null;
  logo: IgdbCover;
  websites: IgdbCompanyWebsite[];
};

export type IgdbInvolvedCompany = {
  company: {
    id?: number;
    name?: string;
    slug?: string;
  } | null;
  developer?: boolean;
  publisher?: boolean;
};

export type IgdbScreenshot = {
  image_id?: string | null;
} | null;

export type IgdbGameVideo = {
  video_id?: string | null;
  name?: string | null;
} | null;

export type IgdbExternalLink = {
  url?: string | null;
  category?: number | null;
} | null;

export type IgdbGame = {
  id: number;
  name: string;
  slug: string | null;
  summary: string | null;
  first_release_date: number | null;
  rating?: number | null;
  total_rating: number | null;
  total_rating_count: number | null;
  cover: IgdbCover;
  genres?: IgdbGenre[];
  platforms?: IgdbPlatform[];
  themes?: IgdbTheme[];
  game_modes?: IgdbGameMode[];
  involved_companies?: IgdbInvolvedCompany[];
  storyline?: string | null;
  screenshots?: IgdbScreenshot[] | null;
  videos?: IgdbGameVideo[] | null;
  websites?: IgdbExternalLink[] | null;
  external_games?: IgdbExternalLink[] | null;
  similar_games?: IgdbGame[] | null;
};

export type IgdbInvolvedCompanyGameRow = {
  game: IgdbGame | null;
};

export type IgdbFranchise = {
  id: number;
  name: string;
  slug: string;
  games?: Array<{ id: number }>;
};

export type FranchiseGame = {
  id: number;
  name: string;
  slug: string | null;
  summary: string | null;
  first_release_date: number | null;
  rating: number | null;
  cover: IgdbCover;
  genres?: IgdbGenre[];
  platforms?: IgdbPlatform[];
};

export type GameCardData = {
  id: number;
  name: string;
  slug?: string | null;
  coverImageId: string | null;
  firstReleaseDate?: number | null;
  releaseYear?: number | null;
  totalRating?: number | null;
  totalRatingCount?: number | null;
  genres: string[];
  platforms: string[];
  summary?: string | null;
};

export type GameSortMode = "top-rated" | "newest" | "upcoming" | "name";

export type TwitchTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

export type IgdbApiErrorResponse = {
  title?: string;
  status?: number;
  cause?: string;
};

export type IgdbRequestOptions = {
  endpoint: string;
  query: string;
};

export type CachedTwitchToken = {
  accessToken: string;
  expiresAt: number;
};
