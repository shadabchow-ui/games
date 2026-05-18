import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";

const navItems = [
  { title: "Home", path: "/" },
  { title: "Games", path: "/games" },
  { title: "Recommend", path: "/recommend" },
  { title: "Compare", path: "/compare" },
  { title: "Platforms", path: "/platforms" },
  { title: "Genres", path: "/genres" },
  { title: "Companies", path: "/companies" },
  { title: "Search", path: "/search" },
];

export async function Navbar() {
  return (
    <nav className="relative border-b border-neutral-800 bg-black/90 px-4 py-4 backdrop-blur lg:px-6">
      <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={navItems} />
        </Suspense>
      </div>
      <div className="flex w-full items-center gap-6">
        <div className="flex min-w-0 flex-1 items-center">
          <Link
            href="/"
            prefetch={true}
            aria-label="Upcube Games home"
            className="mr-6 flex shrink-0 items-center"
          >
            <Image
              src="/brand/logo-mark.png"
              alt="Upcube Games logo"
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
          </Link>
          {navItems.length ? (
            <ul className="hidden flex-wrap gap-5 text-sm md:flex md:items-center">
              {navItems.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    className="text-neutral-600 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-200"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
