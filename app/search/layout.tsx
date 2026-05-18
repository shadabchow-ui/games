import Footer from "components/layout/footer";
import ChildrenWrapper from "./children-wrapper";
import { Suspense } from "react";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-auto min-h-screen w-full max-w-(--breakpoint-2xl) px-4 pb-8 text-black dark:text-white">
        <Suspense fallback={null}>
          <ChildrenWrapper>{children}</ChildrenWrapper>
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
