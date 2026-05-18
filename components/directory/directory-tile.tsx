import Link from "next/link";

type DirectoryTileProps = {
  title: string;
  href: string;
  subtitle?: string;
};

export function DirectoryTile({ title, href, subtitle }: DirectoryTileProps) {
  return (
    <Link
      className="block rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-blue-600 dark:border-neutral-800 dark:bg-black"
      href={href}
      prefetch={false}
    >
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {subtitle ? (
        <p className="pt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {subtitle}
        </p>
      ) : null}
    </Link>
  );
}
