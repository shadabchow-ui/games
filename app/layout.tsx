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
      <body className="bg-black text-white selection:bg-teal-300 selection:text-black">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
