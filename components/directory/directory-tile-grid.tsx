import Link from "next/link";
import type { DirectoryItem } from "lib/igdb/types";

export function DirectoryTileGrid({
  items,
  kind,
}: {
  items: DirectoryItem[];
  kind: "genre" | "platform";
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href="#"
            aria-disabled
            className="block rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 transition hover:border-neutral-400 hover:text-black dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white"
          >
            <span className="font-medium">{item.name}</span>
            <span className="ml-2 text-xs uppercase text-neutral-500 dark:text-neutral-400">
              {kind}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
