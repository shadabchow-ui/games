import Grid from "components/grid";

export default function Loading() {
  return (
    <>
      <div className="mb-4 h-6" />
      <Grid className="grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array(12)
          .fill(0)
          .map((_, index) => {
            return (
              <Grid.Item key={index}>
                <div className="animate-pulse rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                  <div className="aspect-[3/4] w-full rounded-lg bg-neutral-100 dark:bg-neutral-800" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-neutral-100 dark:bg-neutral-800" />
                </div>
              </Grid.Item>
            );
          })}
      </Grid>
    </>
  );
}
