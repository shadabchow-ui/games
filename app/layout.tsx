import { Navbar } from "components/layout/navbar";
import { GeistSans } from "geist/font/sans";
import { ReactNode } from "react";
import "./globals.css";
import { baseUrl } from "lib/utils";

const appName = "Upcube Games";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  robots: {
    follow: true,
    index: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
