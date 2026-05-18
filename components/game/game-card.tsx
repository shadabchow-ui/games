import Link from "next/link";
import { GameMeta } from "./game-meta";
import { GameCover } from "./game-cover";
import type { GameCardData } from "lib/igdb/types";

export type { GameCardData } from "lib/igdb/types";

export function GameCard({
  game,
  priority = false,
}: {
  game: GameCardData;
  priority?: boolean;
}) {
  const title = game.name || "Untitled game";
  const content = (
    <article className="group overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <GameCover imageId={game.coverImageId} priority={priority} title={title} />
      </div>
      <div className="p-3">
        <GameMeta
          genres={game.genres}
          platforms={game.platforms}
          releaseYear={game.releaseYear}
          summary={game.summary}
          title={title}
          totalRating={game.totalRating}
          totalRatingCount={game.totalRatingCount}
        />
      </div>
    </article>
  );

  if (!game.slug) {
    return content;
  }

  return (
    <Link className="block h-full" href={`/game/${game.slug}`} prefetch={false}>
      {content}
    </Link>
  );
}
