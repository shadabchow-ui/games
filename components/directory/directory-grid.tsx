import { DirectoryTile } from "./directory-tile";

type DirectoryEntry = {
  id: number;
  name: string;
  slug: string;
};

export function DirectoryGrid({
  items,
  hrefPrefix,
  emptyMessage,
}: {
  items: DirectoryEntry[];
  hrefPrefix: "/genre" | "/platform";
  emptyMessage: string;
}) {
  if (!items.length) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <DirectoryTile
          href={`${hrefPrefix}/${item.slug}`}
          key={item.id}
          subtitle={`Browse ${item.name} games`}
          title={item.name}
        />
      ))}
    </div>
  );
}
