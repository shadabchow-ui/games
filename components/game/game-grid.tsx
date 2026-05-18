import { GameCard, type GameCardData } from "./game-card";

export function GameGrid({
  games,
  emptyMessage,
}: {
  games: GameCardData[];
  emptyMessage?: string;
}) {
  if (!games.length) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
        {emptyMessage ?? "No games available right now."}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {games.map((game) => (
        <GameCard game={game} key={game.id} />
      ))}
    </div>
  );
}

export default GameGrid;
