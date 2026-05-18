import clsx from "clsx";
import Image from "next/image";

const IGDB_IMAGE_BASE = "https://images.igdb.com/igdb/image/upload";

type IGDBImageSize =
  | "cover_small"
  | "cover_big"
  | "screenshot_med"
  | "logo_med"
  | "720p";

function igdbImageUrl(
  imageId: string | null | undefined,
  size: IGDBImageSize = "cover_big",
) {
  if (!imageId) {
    return null;
  }

  return `${IGDB_IMAGE_BASE}/t_${size}/${imageId}.jpg`;
}

export function GameCover({
  imageId,
  title,
  priority = false,
  className,
  imageClassName,
  fill = true,
  size = "cover_big",
}: {
  imageId?: string | null;
  title: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  fill?: boolean;
  size?: IGDBImageSize;
}) {
  const src = igdbImageUrl(imageId, size);

  return (
    <div
      className={clsx(
        "group relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black",
        className,
      )}
    >
      {src ? (
        <Image
          alt={title}
          className={clsx(
            "relative h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105",
            imageClassName,
          )}
          fill={fill}
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          src={src}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-xs font-medium text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          No cover
        </div>
      )}
    </div>
  );
}
