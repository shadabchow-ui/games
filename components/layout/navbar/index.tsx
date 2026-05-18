import LogoSquare from "components/logo-square";
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
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={navItems} />
        </Suspense>
      </div>
      <div className="flex w-full items-center">
        <div className="flex w-full md:w-1/3">
          <Link
            href="/"
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <LogoSquare />
            <div className="ml-2 flex-none text-sm font-medium uppercase md:hidden lg:block">
              Upcube Games
            </div>
          </Link>
          {navItems.length ? (
            <ul className="hidden gap-6 text-sm md:flex md:items-center">
              {navItems.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="hidden justify-center md:flex md:w-1/3" />
        <div className="flex justify-end md:w-1/3">
          <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Video game directory
          </span>
        </div>
      </div>
    </nav>
  );
}
